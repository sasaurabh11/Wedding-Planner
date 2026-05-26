import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  const { intakeId } = await params;

  if (!intakeId) {
    return Response.json({ error: "intakeId is required" }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("intake_id", intakeId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return Response.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }

  return Response.json(data || []);
}
