import { NextRequest } from "next/server";
import { genAI } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { GeminiResponse } from "@/lib/types";
import { VENUE_TYPES, BUDGET_BRACKETS, PRIORITIES } from "@/lib/constants";

const VALID_VENUE_TYPES: string[] = VENUE_TYPES.map((v) => v.value);
const VALID_BUDGET_BRACKETS: string[] = BUDGET_BRACKETS.map((b) => b.value);
const VALID_PRIORITIES: string[] = [...PRIORITIES];

function buildPrompt(data: {
  weddingDate: string;
  guestCount: number;
  city: string;
  venueType: string;
  budgetBracket: string;
  priorityOne: string;
  priorityTwo: string;
}): string {
  const budgetMap: Record<string, { min: number; max: number; mid: number }> = {
    "5L-10L": { min: 500000, max: 1000000, mid: 750000 },
    "10L-25L": { min: 1000000, max: 2500000, mid: 1750000 },
    "25L-50L": { min: 2500000, max: 5000000, mid: 3750000 },
    "50L-1Cr": { min: 5000000, max: 10000000, mid: 7500000 },
    "1Cr+": { min: 10000000, max: 20000000, mid: 15000000 },
  };
  const budget = budgetMap[data.budgetBracket] || budgetMap["10L-25L"];

  return `You are an expert Indian wedding planner with 20+ years of experience across all major Indian cities.

A couple needs a detailed vendor budget allocation for their wedding with these details:
- Wedding Date: ${data.weddingDate}
- Guest Count: ${data.guestCount}
- City: ${data.city}
- Venue Type: ${data.venueType.replace("_", " ")}
- Budget Range: ₹${(budget.min / 100000).toFixed(0)}L – ₹${(budget.max / 100000).toFixed(0)}L (approximate mid-point: ₹${(budget.mid / 100000).toFixed(0)}L)
- Top Priority 1: ${data.priorityOne}
- Top Priority 2: ${data.priorityTwo}

Your task:
1. Allocate the total budget across 8–10 vendor categories relevant to an Indian wedding.
2. Rank "${data.priorityOne}" as priority_rank 1 and "${data.priorityTwo}" as priority_rank 2. Allocate a higher-than-average percentage to these.
3. Allocate the rest across other essential categories (e.g., Venue, Food & Catering, Décor, Photography, Videography, Bridal Makeup, Wedding Attire, Invitations, Music/DJ, Transportation, etc.)
4. Ensure all suggested_budget_inr values sum to approximately 95% of ₹${budget.mid} (leave a 5% buffer).
5. Scale amounts appropriately for ${data.guestCount} guests in ${data.city}.
6. For destination weddings: factor in logistics, travel coordination, local vendor premiums.
7. For very small budgets (₹5L–₹10L): prioritize ruthlessly, combine categories where needed.
8. Write a specific, actionable rationale for each category referencing guest count and city.
9. Write a 2–3 sentence overall strategy summary.

Respond with valid JSON only. Do not include markdown code fences, backticks, or any explanation outside the JSON object.

Return exactly this JSON structure:
{
  "recommendations": [
    {
      "vendor_category": "Photography",
      "priority_rank": 1,
      "suggested_budget_inr": 150000,
      "rationale": "As your top priority, this allocation captures every moment for your ${data.guestCount}-guest wedding in ${data.city}."
    }
  ],
  "summary": "2-3 sentence overall strategy here."
}`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { weddingDate, guestCount, city, venueType, budgetBracket, priorityOne, priorityTwo } = body;

  if (!weddingDate || typeof weddingDate !== "string") {
    return Response.json({ error: "weddingDate is required and must be a string" }, { status: 400 });
  }
  const parsedDate = new Date(weddingDate as string);
  if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
    return Response.json({ error: "weddingDate must be a valid future date" }, { status: 400 });
  }
  if (!guestCount || typeof guestCount !== "number" || guestCount < 10 || guestCount > 2000) {
    return Response.json({ error: "guestCount must be a number between 10 and 2000" }, { status: 400 });
  }
  if (!city || typeof city !== "string" || city.trim().length < 2) {
    return Response.json({ error: "city is required and must be at least 2 characters" }, { status: 400 });
  }
  if (!venueType || !VALID_VENUE_TYPES.includes(venueType as string)) {
    return Response.json({ error: `venueType must be one of: ${VALID_VENUE_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!budgetBracket || !VALID_BUDGET_BRACKETS.includes(budgetBracket as string)) {
    return Response.json({ error: `budgetBracket must be one of: ${VALID_BUDGET_BRACKETS.join(", ")}` }, { status: 400 });
  }
  if (!priorityOne || !VALID_PRIORITIES.includes(priorityOne as string)) {
    return Response.json({ error: "priorityOne must be a valid priority" }, { status: 400 });
  }
  if (!priorityTwo || !VALID_PRIORITIES.includes(priorityTwo as string)) {
    return Response.json({ error: "priorityTwo must be a valid priority" }, { status: 400 });
  }
  if (priorityOne === priorityTwo) {
    return Response.json({ error: "priorityOne and priorityTwo must be different" }, { status: 400 });
  }

  const formData = {
    weddingDate: weddingDate as string,
    guestCount: guestCount as number,
    city: (city as string).trim(),
    venueType: venueType as string,
    budgetBracket: budgetBracket as string,
    priorityOne: priorityOne as string,
    priorityTwo: priorityTwo as string,
  };

  const prompt = buildPrompt(formData);

  try {
    const jsonModel = genAI.getGenerativeModel({
      model: "gemma-4-31b-it",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await jsonModel.generateContent(prompt);
    const rawText = result.response.text();

    // Strip any accidental markdown fences, then find the outermost JSON object
    const stripped = rawText.replace(/```json|```/g, "").trim();
    const jsonStart = stripped.indexOf("{");
    const jsonEnd = stripped.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON object found in Gemini response:", stripped.slice(0, 200));
      return Response.json({ error: "Gemini did not return valid JSON" }, { status: 500 });
    }
    const jsonString = stripped.slice(jsonStart, jsonEnd + 1);
    const parsed: GeminiResponse = JSON.parse(jsonString);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return Response.json({ error: "Gemini returned invalid recommendations structure" }, { status: 500 });
    }

    const supabase = createClient();

    const { data: intake, error: intakeError } = await supabase
      .from("wedding_intakes")
      .insert({
        wedding_date: formData.weddingDate,
        guest_count: formData.guestCount,
        city: formData.city,
        venue_type: formData.venueType,
        budget_bracket: formData.budgetBracket,
        priority_one: formData.priorityOne,
        priority_two: formData.priorityTwo,
        ai_summary: parsed.summary,
      })
      .select()
      .single();

    if (intakeError || !intake) {
      console.error("Supabase intake error:", intakeError);
      return Response.json({ error: "Failed to save intake data" }, { status: 500 });
    }

    const recommendationsToInsert = parsed.recommendations.map((rec) => ({
      intake_id: intake.id,
      vendor_category: rec.vendor_category,
      priority_rank: rec.priority_rank,
      suggested_budget_inr: rec.suggested_budget_inr,
      rationale: rec.rationale,
    }));

    const { data: savedRecommendations, error: recError } = await supabase
      .from("ai_recommendations")
      .insert(recommendationsToInsert)
      .select();

    if (recError || !savedRecommendations) {
      console.error("Supabase recommendations error:", recError);
      return Response.json({ error: "Failed to save recommendations" }, { status: 500 });
    }

    return Response.json({
      intakeId: intake.id,
      recommendations: savedRecommendations,
      summary: parsed.summary,
    });
  } catch (err) {
    console.error("Recommend API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
