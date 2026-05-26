export const VENUE_TYPES = [
  { value: "banquet_hall", label: "Banquet Hall" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "destination", label: "Destination" },
  { value: "garden", label: "Garden" },
  { value: "hotel", label: "Hotel" },
  { value: "other", label: "Other" },
] as const;

export const BUDGET_BRACKETS = [
  { value: "5L-10L", label: "₹5L – ₹10L", min: 500000, max: 1000000 },
  { value: "10L-25L", label: "₹10L – ₹25L", min: 1000000, max: 2500000 },
  { value: "25L-50L", label: "₹25L – ₹50L", min: 2500000, max: 5000000 },
  { value: "50L-1Cr", label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { value: "1Cr+", label: "₹1Cr+", min: 10000000, max: 20000000 },
] as const;

export const PRIORITIES = [
  "Photography",
  "Videography",
  "Décor",
  "Food & Catering",
  "Music & Entertainment",
  "Bridal Makeup",
  "Wedding Attire",
  "Invitations & Stationery",
  "Honeymoon",
  "Venue",
] as const;

export type Priority = (typeof PRIORITIES)[number];
export type VenueType = (typeof VENUE_TYPES)[number]["value"];
export type BudgetBracket = (typeof BUDGET_BRACKETS)[number]["value"];
