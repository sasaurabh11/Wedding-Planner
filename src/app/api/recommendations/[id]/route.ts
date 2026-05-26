import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: intake, error: intakeError } = await supabase
    .from("wedding_intakes")
    .select("*")
    .eq("id", id)
    .single();

  if (intakeError || !intake) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { data: recommendations, error: recError } = await supabase
    .from("ai_recommendations")
    .select("*")
    .eq("intake_id", id)
    .order("priority_rank", { ascending: true });

  if (recError) {
    console.error("Error fetching recommendations:", recError);
    return Response.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }

  return Response.json({
    intake,
    recommendations: recommendations || [],
    summary: intake.ai_summary || "",
  });
}
