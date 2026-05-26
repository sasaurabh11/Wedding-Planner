"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Recommendation } from "@/lib/types";

interface PaymentFormProps {
  intakeId: string;
  categories: Recommendation[];
  onPaymentAdded: () => void;
}

interface PaymentFormState {
  vendorCategory: string;
  vendorName: string;
  amountPaid: string;
  paymentDate: string;
}

const EMPTY_FORM: PaymentFormState = {
  vendorCategory: "",
  vendorName: "",
  amountPaid: "",
  paymentDate: format(new Date(), "yyyy-MM-dd"),
};

export function PaymentForm({ intakeId, categories, onPaymentAdded }: PaymentFormProps) {
  const [form, setForm] = useState<PaymentFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.vendorCategory) newErrors.vendorCategory = "Please select a category";
    if (!form.vendorName.trim()) newErrors.vendorName = "Vendor name is required";
    if (!form.amountPaid) {
      newErrors.amountPaid = "Amount is required";
    } else if (isNaN(parseFloat(form.amountPaid)) || parseFloat(form.amountPaid) <= 0) {
      newErrors.amountPaid = "Amount must be a positive number";
    }
    if (!form.paymentDate) newErrors.paymentDate = "Payment date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeId,
          vendorCategory: form.vendorCategory,
          vendorName: form.vendorName.trim(),
          amountPaid: parseFloat(form.amountPaid),
          paymentDate: form.paymentDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log payment");
      }

      toast.success("Payment logged successfully!");
      setForm({ ...EMPTY_FORM, paymentDate: format(new Date(), "yyyy-MM-dd") });
      setErrors({});
      onPaymentAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-gray-100">
      <CardHeader>
        <CardTitle className="font-playfair text-lg">Log a Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vendorCategory">Vendor Category</Label>
              <Select
                value={form.vendorCategory}
                onValueChange={(val: string | null) => {
                  setForm((p) => ({ ...p, vendorCategory: val ?? "" }));
                  setErrors((p) => ({ ...p, vendorCategory: "" }));
                }}
              >
                <SelectTrigger
                  id="vendorCategory"
                  className={errors.vendorCategory ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.vendor_category}>
                      {c.vendor_category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendorCategory && (
                <p className="text-xs text-red-600">{errors.vendorCategory}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                placeholder="e.g. Studio Noir Photography"
                value={form.vendorName}
                onChange={(e) => {
                  setForm((p) => ({ ...p, vendorName: e.target.value }));
                  setErrors((p) => ({ ...p, vendorName: "" }));
                }}
                className={errors.vendorName ? "border-red-500" : ""}
              />
              {errors.vendorName && (
                <p className="text-xs text-red-600">{errors.vendorName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
              <Input
                id="amountPaid"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 50000"
                value={form.amountPaid}
                onChange={(e) => {
                  setForm((p) => ({ ...p, amountPaid: e.target.value }));
                  setErrors((p) => ({ ...p, amountPaid: "" }));
                }}
                className={errors.amountPaid ? "border-red-500" : ""}
              />
              {errors.amountPaid && (
                <p className="text-xs text-red-600">{errors.amountPaid}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={(e) => {
                  setForm((p) => ({ ...p, paymentDate: e.target.value }));
                  setErrors((p) => ({ ...p, paymentDate: "" }));
                }}
                className={errors.paymentDate ? "border-red-500" : ""}
              />
              {errors.paymentDate && (
                <p className="text-xs text-red-600">{errors.paymentDate}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {submitting ? "Logging..." : "Log Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
