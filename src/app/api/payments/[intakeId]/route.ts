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

  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("intake_id", intakeId)
    .order("payment_date", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    return Response.json({ error: "Failed to fetch payments" }, { status: 500 });
  }

  return Response.json(payments || []);
}
