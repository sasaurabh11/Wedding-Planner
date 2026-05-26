"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Step1Props {
  weddingDate: string;
  guestCount: number | "";
  errors: Record<string, string>;
  onChange: (field: string, value: string | number) => void;
}

export function Step1WeddingDetails({ weddingDate, guestCount, errors, onChange }: Step1Props) {
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-charcoal">Wedding Details</h2>
        <p className="text-gray-500 mt-1">Tell us about your special day</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weddingDate" className="text-charcoal font-medium">
          Wedding Date
        </Label>
        <Input
          id="weddingDate"
          type="date"
          min={today}
          value={weddingDate}
          onChange={(e) => onChange("weddingDate", e.target.value)}
          className={errors.weddingDate ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.weddingDate && (
          <p className="text-sm text-red-600">{errors.weddingDate}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestCount" className="text-charcoal font-medium">
          Number of Guests
        </Label>
        <Input
          id="guestCount"
          type="number"
          min={10}
          max={2000}
          placeholder="e.g. 250"
          value={guestCount}
          onChange={(e) => {
            const val = e.target.value;
            onChange("guestCount", val === "" ? "" : parseInt(val, 10));
          }}
          className={errors.guestCount ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.guestCount ? (
          <p className="text-sm text-red-600">{errors.guestCount}</p>
        ) : (
          <p className="text-xs text-gray-400">Between 10 and 2,000 guests</p>
        )}
      </div>
    </div>
  );
}
