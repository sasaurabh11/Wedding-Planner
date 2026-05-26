import { NextRequest } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { ChatMessage, Recommendation } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { intakeId, messages, recommendations } = body;

  if (!intakeId || typeof intakeId !== "string") {
    return Response.json({ error: "intakeId is required" }, { status: 400 });
  }
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required and must not be empty" }, { status: 400 });
  }
  if (!recommendations || !Array.isArray(recommendations)) {
    return Response.json({ error: "recommendations array is required" }, { status: 400 });
  }

  const typedMessages = messages as ChatMessage[];
  const typedRecommendations = recommendations as Recommendation[];
  const lastMessage = typedMessages[typedMessages.length - 1];

  const systemContext = `You are a helpful, warm, and knowledgeable Indian wedding planning assistant.
The couple has received the following personalized vendor budget recommendations: ${JSON.stringify(typedRecommendations, null, 2)}.
Answer their questions helpfully, specifically, and practically based on their plan.
Reference specific budget amounts and vendor categories when relevant.
Be encouraging and supportive. Use clear formatting with bullet points or numbered lists where appropriate. Keep responses concise but complete.`;

  try {
    // Save the user message to DB
    const supabase = createClient();
    await supabase.from("chat_messages").insert({
      intake_id: intakeId,
      role: "user",
      content: lastMessage.parts[0].text,
    });

    const history: ChatMessage[] = [
      { role: "user", parts: [{ text: systemContext }] },
      {
        role: "model",
        parts: [{ text: "I understand your wedding plan completely. I can see your budget allocations across all vendor categories. I'm here to help you make the most of your wedding budget and answer any questions you have. What would you like to know?" }],
      },
      ...typedMessages.slice(0, -1),
    ];

    const chat = geminiModel.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    // Collect full response while streaming to client, then save to DB
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
          controller.close();
          // Save assistant response after stream completes
          await supabase.from("chat_messages").insert({
            intake_id: intakeId,
            role: "model",
            content: fullResponse,
          });
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
