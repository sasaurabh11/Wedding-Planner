"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VENUE_TYPES } from "@/lib/constants";

interface Step2Props {
  city: string;
  venueType: string;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function Step2Venue({ city, venueType, errors, onChange }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold text-charcoal">Venue & Location</h2>
        <p className="text-gray-500 mt-1">Where will you celebrate?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="text-charcoal font-medium">
          City
        </Label>
        <Input
          id="city"
          type="text"
          placeholder="e.g. Mumbai, Delhi, Jaipur"
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          className={errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="venueType" className="text-charcoal font-medium">
          Venue Type
        </Label>
        <Select value={venueType} onValueChange={(val: string | null) => onChange("venueType", val ?? "")}>
          <SelectTrigger
            id="venueType"
            className={errors.venueType ? "border-red-500 focus:ring-red-500" : ""}
          >
            <SelectValue placeholder="Select venue type" />
          </SelectTrigger>
          <SelectContent>
            {VENUE_TYPES.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.venueType && <p className="text-sm text-red-600">{errors.venueType}</p>}
      </div>
    </div>
  );
}
