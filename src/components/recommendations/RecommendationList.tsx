"use client";

import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { Recommendation } from "@/lib/types";

interface RecommendationListProps {
  recommendations: Recommendation[];
  totalBudget: number;
}

export function RecommendationList({ recommendations, totalBudget }: RecommendationListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          totalBudget={totalBudget}
        />
      ))}
    </div>
  );
}
