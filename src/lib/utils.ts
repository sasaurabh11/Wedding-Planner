import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BUDGET_BRACKETS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseBudgetBracket(bracket: string): number {
  const found = BUDGET_BRACKETS.find((b) => b.value === bracket);
  if (!found) return 1750000; // default fallback
  return Math.round((found.min + found.max) / 2);
}

export function getBudgetBracketLabel(bracket: string): string {
  const found = BUDGET_BRACKETS.find((b) => b.value === bracket);
  return found ? found.label : bracket;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}
