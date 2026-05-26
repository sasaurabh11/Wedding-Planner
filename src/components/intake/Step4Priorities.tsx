"use client";

import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";

const PRIORITY_ICONS: Record<string, string> = {
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
};

interface Step4Props {
  priorityOne: string;
  priorityTwo: string;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function Step4Priorities({ priorityOne, priorityTwo, errors, onChange }: Step4Props) {
  const handleSelect = (priority: string) => {
    if (priorityOne === priority) {
      onChange("priorityOne", "");
      return;
    }
    if (priorityTwo === priority) {
      onChange("priorityTwo", "");
      return;
    }
    if (!priorityOne) {
      onChange("priorityOne", priority);
      return;
    }
    if (!priorityTwo) {
      onChange("priorityTwo", priority);
      return;
    }
    // Both filled — replace the second priority
    onChange("priorityTwo", priority);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-charcoal">Top Priorities</h2>
        <p className="text-gray-500 mt-1">Select exactly 2 things that matter most to you</p>
      </div>

      {(priorityOne || priorityTwo) && (
        <div className="flex gap-2 flex-wrap">
          {priorityOne && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              <span className="font-bold text-amber-600">#1</span>
              {priorityOne}
            </span>
          )}
          {priorityTwo && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
              <span className="font-bold text-amber-500">#2</span>
              {priorityTwo}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRIORITIES.map((priority) => {
          const isFirst = priorityOne === priority;
          const isSecond = priorityTwo === priority;
          const isSelected = isFirst || isSecond;

          return (
            <button
              key={priority}
              type="button"
              onClick={() => handleSelect(priority)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200 hover:border-amber-400 hover:bg-amber-50",
                isFirst
                  ? "border-amber-500 bg-amber-50"
                  : isSecond
                  ? "border-amber-300 bg-amber-50/50"
                  : "border-gray-200 bg-white"
              )}
            >
              <span className="text-xl">{PRIORITY_ICONS[priority]}</span>
              <span
                className={cn(
                  "text-xs font-medium leading-tight",
                  isSelected ? "text-amber-700" : "text-charcoal"
                )}
              >
                {priority}
              </span>
              {isFirst && (
                <span className="text-[10px] font-bold text-amber-600">#1</span>
              )}
              {isSecond && (
                <span className="text-[10px] font-bold text-amber-500">#2</span>
              )}
            </button>
          );
        })}
      </div>

      {errors.priorities && (
        <p className="text-sm text-red-600">{errors.priorities}</p>
      )}
    </div>
  );
}
