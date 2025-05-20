// Suggested file: src/components/cases/CasePaymentsSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Assuming you might want badges for status
import { MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react"; // Added Loader2
import { format } from "date-fns";
import { toast } from "sonner";

// Import hooks and types
import {
  usePaymentsQuery,
  useDeletePaymentMutation,
} from "@/hooks/usePayments"; // Adjust path
import { CasePayment, PaymentStatus } from "@/types/payments"; // Import from payments.ts instead of types.ts
import { PaymentEditModal } from "@/components/payments/PaymentEditModal"; // Assuming this component exists
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"; // Assuming this exists
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
interface CasePaymentsSectionProps {
  caseId: string; // The ID of the case to fetch payments for
}

const CasePaymentsSection: React.FC<CasePaymentsSectionProps> = ({
  caseId,
}) => {
  // Fetch payments for the specific case using the hook
  const {
    data: payments = [],
    isLoading,
    error,
  } = usePaymentsQuery({ caseId });

  // Mutation hook for deleting payments
  const deleteMutation = useDeletePaymentMutation();
  const isDeleting = deleteMutation.isPending;

  // State for managing the edit modal
  const [selectedPayment, setSelectedPayment] = useState<CasePayment | null>(
    null
  );
  const [isPaymentEditModalOpen, setIsPaymentEditModalOpen] = useState(false);

  // State for managing the delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<CasePayment | null>(
    null
  );

  // Handle error from the query
  if (error) {
    // The hook's onError already shows a toast, but you might want to render an error message here too
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            Error loading payments: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state from the query
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle opening the edit modal
  const handlePaymentEdit = (payment: CasePayment) => {
    setSelectedPayment(payment);
    setIsPaymentEditModalOpen(true);
  };

  // Handle closing the edit modal
  const handleEditModalClose = () => {
    setIsPaymentEditModalOpen(false);
    setSelectedPayment(null); // Clear selected payment when closing
  };

  // Handle clicking the delete button
  const handleDeleteClick = (payment: CasePayment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  // Handle confirming the delete action
  const handleDeleteConfirm = () => {
    if (!paymentToDelete) return;

    deleteMutation.mutate(paymentToDelete.payment_id, {
      // Use the mutation hook
      onSuccess: () => {
        // Toast is handled by the hook's onSuccess
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      },
      onError: (error) => {
        // Toast is handled by the hook's onError
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      },
    });
  };

  // Helper to get badge variant based on payment status (optional)
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default">Paid</Badge>;
      case "DUE":
        return <Badge variant="secondary">Due</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      case "PARTIAL":
        return <Badge variant="outline">Partial</Badge>;
      case "UNPAID":
        return <Badge variant="outline">Unpaid</Badge>;
      case "WAIVED":
        return <Badge variant="outline">Waived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>; // Display status string if unknown
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payments ({payments.length})</CardTitle>{" "}
          {/* Display count */}
          {/* Link to add a new payment for this case */}
          <Button asChild size="sm">
            <Link to={`/cases/${caseId}/payments/new`}>Add Payment</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Due</TableHead> {/* Changed to Amount Due */}
                <TableHead>Amount Paid</TableHead> {/* Added Amount Paid */}
                <TableHead>Status</TableHead> {/* Added Status */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.payment_id}>
                  {" "}
                  {/* Use payment_id as key */}
                  <TableCell className="font-medium">
                    {payment.milestone_description || "Payment"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.due_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    ${payment.amount_due?.toFixed(2) || "0.00"}
                  </TableCell>{" "}
                  {/* Format currency */}
                  <TableCell>
                    ${payment.amount_paid?.toFixed(2) || "0.00"}
                  </TableCell>{" "}
                  {/* Format currency */}
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>{" "}
                  {/* Display status badge */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handlePaymentEdit(payment)} // Pass the payment object
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(payment)} // Pass the payment object
                          className="text-destructive"
                          disabled={isDeleting} // Disable delete while deleting
                        >
                          {isDeleting &&
                          paymentToDelete?.payment_id === payment.payment_id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No payments for this case.</p>
        )}
      </CardContent>

      {/* Payment Edit Modal */}
      {selectedPayment && (
        <PaymentEditModal
          paymentId={selectedPayment.payment_id} // Pass the payment_id
          isOpen={isPaymentEditModalOpen}
          onClose={handleEditModalClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {paymentToDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Payment"
          description={`Are you sure you want to delete this payment? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      )}
    </Card>
  );
};

export default CasePaymentsSection;
