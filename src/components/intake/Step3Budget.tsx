"use client";

import { cn } from "@/lib/utils";
import { BUDGET_BRACKETS } from "@/lib/constants";

const BUDGET_ICONS: Record<string, string> = {
  "5L-10L": "🌸",
  "10L-25L": "💐",
  "25L-50L": "🌺",
  "50L-1Cr": "👑",
  "1Cr+": "✨",
};

interface Step3Props {
  budgetBracket: string;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function Step3Budget({ budgetBracket, errors, onChange }: Step3Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-charcoal">Budget</h2>
        <p className="text-gray-500 mt-1">What is your overall wedding budget?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BUDGET_BRACKETS.map((bracket) => {
          const isSelected = budgetBracket === bracket.value;
          return (
            <button
              key={bracket.value}
              type="button"
              onClick={() => onChange("budgetBracket", bracket.value)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-amber-400 hover:bg-amber-50",
                isSelected
                  ? "border-amber-500 bg-amber-50 shadow-sm"
                  : "border-gray-200 bg-white"
              )}
            >
              <span className="text-2xl">{BUDGET_ICONS[bracket.value]}</span>
              <div>
                <p
                  className={cn(
                    "font-semibold",
                    isSelected ? "text-amber-700" : "text-charcoal"
                  )}
                >
                  {bracket.label}
                </p>
                <p className="text-xs text-gray-400">
                  {bracket.value === "1Cr+"
                    ? "Luxury wedding"
                    : bracket.value === "5L-10L"
                    ? "Intimate celebration"
                    : "Beautiful & memorable"}
                </p>
              </div>
              {isSelected && (
                <div className="ml-auto w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {errors.budgetBracket && (
        <p className="text-sm text-red-600">{errors.budgetBracket}</p>
      )}
    </div>
  );
}
