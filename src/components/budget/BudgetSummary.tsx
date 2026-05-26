"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Recommendation, Payment } from "@/lib/types";
import { formatCurrency, parseBudgetBracket } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BudgetSummaryProps {
  budgetBracket: string;
  recommendations: Recommendation[];
  payments: Payment[];
}

export function BudgetSummary({ budgetBracket, recommendations, payments }: BudgetSummaryProps) {
  const totalBudget = parseBudgetBracket(budgetBracket);
  const totalAllocated = recommendations.reduce((sum, r) => sum + r.suggested_budget_inr, 0);
  const totalSpent = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const categoryBreakdown = recommendations.map((rec) => {
    const spent = payments
      .filter((p) => p.vendor_category === rec.vendor_category)
      .reduce((sum, p) => sum + p.amount_paid, 0);
    const catRemaining = rec.suggested_budget_inr - spent;
    const isOverBudget = spent > rec.suggested_budget_inr;
    return { ...rec, spent, catRemaining, isOverBudget };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Budget</p>
            <p className="font-playfair text-xl font-bold text-charcoal mt-1">
              {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Allocated</p>
            <p className="font-playfair text-xl font-bold text-amber-600 mt-1">
              {formatCurrency(totalAllocated)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Spent</p>
            <p className="font-playfair text-xl font-bold text-charcoal mt-1">
              {formatCurrency(totalSpent)}
            </p>
          </CardContent>
        </Card>
        <Card className={cn("border", remaining < 0 ? "border-red-200 bg-red-50" : "border-green-100 bg-green-50")}>
          <CardContent className="p-4">
            <p className={cn("text-xs font-medium uppercase tracking-wide", remaining < 0 ? "text-red-500" : "text-green-600")}>
              {remaining < 0 ? "Over Budget" : "Remaining"}
            </p>
            <p className={cn("font-playfair text-xl font-bold mt-1", remaining < 0 ? "text-red-600" : "text-green-700")}>
              {formatCurrency(Math.abs(remaining))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-charcoal">Budget Used</span>
            <span className={cn("text-sm font-bold", spentPercentage > 100 ? "text-red-600" : "text-amber-600")}>
              {spentPercentage}%
            </span>
          </div>
          <Progress
            value={Math.min(spentPercentage, 100)}
            className="h-3"
          />
          <p className="text-xs text-gray-400 mt-1">
            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="font-playfair text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Allocated</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Spent</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-gray-50 transition-colors",
                      item.isOverBudget ? "bg-red-50" : item.spent > 0 ? "bg-green-50/50" : ""
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-charcoal">{item.vendor_category}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(item.suggested_budget_inr)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-charcoal">
                      {formatCurrency(item.spent)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right font-semibold",
                        item.isOverBudget ? "text-red-600" : "text-green-600"
                      )}
                    >
                      {item.isOverBudget ? "-" : ""}
                      {formatCurrency(Math.abs(item.catRemaining))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
