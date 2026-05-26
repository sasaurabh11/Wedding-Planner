"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { PaymentForm } from "@/components/budget/PaymentForm";
import { PaymentLog } from "@/components/budget/PaymentLog";
import { RecommendationResponse, Payment } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
      <div className="border border-gray-100 rounded-xl p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4">
          <Skeleton className="h-6 w-40" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-t border-gray-50">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`/api/payments/${id}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data);
    } catch {
      toast.error("Failed to refresh payments");
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const init = async () => {
      try {
        const [recRes, payRes] = await Promise.all([
          fetch(`/api/recommendations/${id}`),
          fetch(`/api/payments/${id}`),
        ]);

        if (!recRes.ok) {
          const err = await recRes.json();
          throw new Error(err.error || "Failed to load plan");
        }

        const [recData, payData] = await Promise.all([
          recRes.json() as Promise<RecommendationResponse>,
          payRes.ok ? payRes.json() : Promise.resolve([]),
        ]);

        setData(recData);
        setPayments(payData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFAF5] py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <BudgetSkeleton />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">😔</div>
          <h2 className="font-playfair text-2xl font-bold text-[#1C1917]">
            Budget Not Found
          </h2>
          <p className="text-gray-500">
            {error || "We couldn't find this wedding plan."}
          </p>
          <Link
            href="/intake"
            className="inline-flex items-center justify-center rounded-lg px-4 h-9 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
          >
            Create a New Plan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFAF5] py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/recommendations/${id}`}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                ← Back to Recommendations
              </Link>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#1C1917]">
              Budget Tracker
            </h1>
            <p className="text-gray-500 mt-1">
              {data.intake.city} · {data.intake.guest_count} guests ·{" "}
              {data.intake.budget_bracket.replace("-", " – ₹").replace("L", "L")}
            </p>
          </div>
        </div>

        <BudgetSummary
          budgetBracket={data.intake.budget_bracket}
          recommendations={data.recommendations}
          payments={payments}
        />

        <PaymentForm
          intakeId={id}
          categories={data.recommendations}
          onPaymentAdded={fetchPayments}
        />

        <PaymentLog payments={payments} />
      </div>
    </main>
  );
}
