"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import { ChatPanel } from "@/components/recommendations/ChatPanel";
import { RecommendationResponse } from "@/lib/types";
import { formatDate, getBudgetBracketLabel, parseBudgetBracket, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function RecommendationsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function RecommendationsPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recommendations/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load recommendations");
        }
        return res.json() as Promise<RecommendationResponse>;
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFAF5] py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <RecommendationsSkeleton />
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
            Plan Not Found
          </h2>
          <p className="text-gray-500">
            {error || "We couldn't find this wedding plan. It may have been removed."}
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

  const { intake, recommendations, summary } = data;
  const totalBudget = parseBudgetBracket(intake.budget_bracket);

  return (
    <main className="min-h-screen bg-[#FDFAF5] py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/intake"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                ← Plan a new wedding
              </Link>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#1C1917]">
              Your Wedding Plan
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              <span>📅 {formatDate(intake.wedding_date)}</span>
              <span>👥 {intake.guest_count} guests</span>
              <span>📍 {intake.city}</span>
              <span>💰 {getBudgetBracketLabel(intake.budget_bracket)}</span>
            </div>
          </div>
          <Link
            href={`/budget/${id}`}
            className="inline-flex items-center justify-center rounded-lg px-4 h-9 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white shrink-0 transition-colors"
          >
            Track Budget →
          </Link>
        </div>

        {summary && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h2 className="font-playfair font-semibold text-amber-800 mb-1">
              AI Strategy Note
            </h2>
            <p className="text-amber-900/80 text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-2xl font-semibold text-[#1C1917]">
              Vendor Recommendations
            </h2>
            <span className="text-sm text-gray-400">
              Total allocated:{" "}
              <span className="font-semibold text-amber-700">
                {formatCurrency(
                  recommendations.reduce((s, r) => s + r.suggested_budget_inr, 0)
                )}
              </span>{" "}
              / {formatCurrency(totalBudget)}
            </span>
          </div>
          <RecommendationList
            recommendations={recommendations}
            totalBudget={totalBudget}
          />
        </div>

        <div>
          <h2 className="font-playfair text-2xl font-semibold text-[#1C1917] mb-4">
            Ask Your AI Wedding Planner
          </h2>
          <ChatPanel intakeId={id} recommendations={recommendations} />
        </div>
      </div>
    </main>
  );
}
