"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Payment } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentLogProps {
  payments: Payment[];
}

export function PaymentLog({ payments }: PaymentLogProps) {
  if (payments.length === 0) {
    return (
      <Card className="border-gray-100">
        <CardContent className="py-12 text-center">
          <div className="text-5xl mb-4">💸</div>
          <h3 className="font-playfair text-xl font-semibold text-charcoal mb-2">
            No payments logged yet
          </h3>
          <p className="text-gray-400 text-sm">
            Add your first payment above to start tracking your wedding expenses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-100">
      <CardHeader>
        <CardTitle className="font-playfair text-lg">Payment History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Vendor</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {formatDate(payment.payment_date)}
                  </td>
                  <td className="py-3 px-4 text-charcoal">{payment.vendor_category}</td>
                  <td className="py-3 px-4 text-charcoal">{payment.vendor_name}</td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-700">
                    {formatCurrency(payment.amount_paid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
