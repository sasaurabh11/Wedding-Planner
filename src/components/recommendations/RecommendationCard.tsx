"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Recommendation } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  Photography: "📸",
  Videography: "🎥",
  Décor: "🌸",
  "Food & Catering": "🍽️",
  "Music & Entertainment": "🎵",
  "Bridal Makeup": "💄",
  "Wedding Attire": "👗",
  "Invitations & Stationery": "✉️",
  Honeymoon: "✈️",
  Venue: "🏛️",
  Transportation: "🚗",
  "Mehendi & Sangeet": "🪔",
  Jewellery: "💎",
  "Wedding Cake": "🎂",
};

const getIcon = (category: string): string => {
  return CATEGORY_ICONS[category] || "💰";
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  totalBudget: number;
}

export function RecommendationCard({ recommendation, totalBudget }: RecommendationCardProps) {
  const percentage = totalBudget > 0
    ? Math.round((recommendation.suggested_budget_inr / totalBudget) * 100)
    : 0;

  const isPriority = recommendation.priority_rank <= 2;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md border",
        isPriority ? "border-amber-200" : "border-gray-100"
      )}
    >
      {isPriority && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600" />
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{getIcon(recommendation.vendor_category)}</span>
            <div>
              <h3 className="font-playfair font-semibold text-charcoal leading-tight">
                {recommendation.vendor_category}
              </h3>
              <span className="text-xs text-gray-400">{percentage}% of budget</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isPriority && (
              <Badge
                className={cn(
                  "text-[10px] px-2 py-0.5",
                  recommendation.priority_rank === 1
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                Priority #{recommendation.priority_rank}
              </Badge>
            )}
            <span className="font-bold text-amber-700 text-lg">
              {formatCurrency(recommendation.suggested_budget_inr)}
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all",
              isPriority ? "bg-amber-500" : "bg-gray-300"
            )}
            style={{ width: `${Math.min(percentage * 2, 100)}%` }}
          />
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{recommendation.rationale}</p>
      </CardContent>
    </Card>
  );
}
