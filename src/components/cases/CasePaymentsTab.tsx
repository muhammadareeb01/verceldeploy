import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CasePayment } from "@/types/payments";

interface CasePaymentsTabProps {
  payments: CasePayment[];
  formatDate: (dateString: string | null | undefined) => string;
  formatCurrency: (amount: number | null | undefined) => string;
}

const CasePaymentsTab: React.FC<CasePaymentsTabProps> = ({
  payments,
  formatDate,
  formatCurrency,
}) => {
  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">
            No payment records found for this case.
          </p>
          <Button className="mt-4" variant="outline">
            Add Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payments ({payments.length})</h3>
        <Button variant="outline">Add Payment</Button>
      </div>
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Due Date</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.payment_id} className="border-b">
                <td className="p-2">
                  {payment.milestone_description || "Payment"}
                </td>
                <td className="p-2">{formatDate(payment.due_date)}</td>
                <td className="p-2">{formatCurrency(payment.amount_due)}</td>
                <td className="p-2">
                  <Badge
                    className={
                      payment.status === "PAID"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }
                  >
                    {payment.status?.toString().replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-2">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CasePaymentsTab;
