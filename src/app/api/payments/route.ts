import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { intakeId, vendorCategory, vendorName, amountPaid, paymentDate } = body;

  if (!intakeId || typeof intakeId !== "string") {
    return Response.json({ error: "intakeId is required" }, { status: 400 });
  }
  if (!vendorCategory || typeof vendorCategory !== "string" || vendorCategory.trim().length === 0) {
    return Response.json({ error: "vendorCategory is required" }, { status: 400 });
  }
  if (!vendorName || typeof vendorName !== "string" || vendorName.trim().length === 0) {
    return Response.json({ error: "vendorName is required" }, { status: 400 });
  }
  if (!amountPaid || typeof amountPaid !== "number" || amountPaid <= 0) {
    return Response.json({ error: "amountPaid must be a positive number" }, { status: 400 });
  }
  if (!paymentDate || typeof paymentDate !== "string") {
    return Response.json({ error: "paymentDate is required" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: intake, error: intakeError } = await supabase
    .from("wedding_intakes")
    .select("id")
    .eq("id", intakeId)
    .single();

  if (intakeError || !intake) {
    return Response.json({ error: "Intake not found" }, { status: 404 });
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      intake_id: intakeId,
      vendor_category: vendorCategory.trim(),
      vendor_name: vendorName.trim(),
      amount_paid: Math.round(amountPaid),
      payment_date: paymentDate,
    })
    .select()
    .single();

  if (paymentError || !payment) {
    console.error("Payment insert error:", paymentError);
    return Response.json({ error: "Failed to save payment" }, { status: 500 });
  }

  return Response.json(payment, { status: 201 });
}
