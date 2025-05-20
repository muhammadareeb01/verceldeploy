// Suggested file: src/components/payments/PaymentEditModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Added DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CasePayment, PaymentUpdateData } from "@/types/payments"; // Import necessary types and DTO
import { PaymentStatus } from "@/types/payments";
// Removed direct updateCompany import
import { toast } from "sonner"; // Keep toast
import { AlertCircle, Loader2 } from "lucide-react"; // Added AlertCircle, Loader2
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components

// Import react-query hooks for payments
import {
  usePaymentByIdQuery,
  useUpdatePaymentMutation,
} from "@/hooks/usePayments"; // Adjust path

interface PaymentEditModalProps {
  paymentId: string; // The ID of the payment to edit
  isOpen: boolean;
  onClose: () => void;
  // Removed onPaymentUpdated prop as mutation hook handles cache invalidation
}

export const PaymentEditModal: React.FC<PaymentEditModalProps> = ({
  paymentId,
  isOpen,
  onClose,
  // onPaymentUpdated, // Removed prop
}) => {
  // Fetch payment data using the query hook
  const {
    data: payment,
    isLoading: isLoadingPayment,
    error: fetchError,
  } = usePaymentByIdQuery(paymentId);

  // Use the update mutation hook
  const updateMutation = useUpdatePaymentMutation();

  // State for form fields, initialized once payment data is loaded
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [amountDue, setAmountDue] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0); // Added amountPaid based on schema
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.DUE); // Use enum for status

  // Initialize form state when the modal opens with a new paymentId or payment data loads
  useEffect(() => {
    if (isOpen && payment) {
      setMilestoneDescription(payment.milestone_description || "");
      setAmountDue(payment.amount_due || 0);
      setAmountPaid(payment.amount_paid || 0); // Initialize amountPaid
      setStatus(payment.status || PaymentStatus.DUE); // Initialize status, default if null
      // You might also want to initialize due_date if it's editable
      // setDueDate(payment.due_date ? new Date(payment.due_date) : undefined);
    }
  }, [isOpen, payment]); // Depend on modal open state and fetched payment data

  // Use mutation hook's state for submitting and error
  const isSubmitting = updateMutation.isPending;
  // Error is accessed directly from the mutation hook if needed for display

  const handleSave = async () => {
    // Basic validation (e.g., amountDue should be >= 0)
    if (amountDue < 0 || amountPaid < 0) {
      toast.error("Validation Error", {
        description: "Amount Due and Amount Paid cannot be negative.",
      });
      return;
    }
    // Add other validations as needed

    // Prepare updated payment data (using PaymentUpdateData DTO)
    const updatedData: PaymentUpdateData = {
      milestone_description: milestoneDescription || null, // Store empty string as null
      amount_due: amountDue,
      amount_paid: amountPaid, // Include amountPaid
      status: status, // Include status
      // Add other editable fields like due_date, invoice_number, payment_date, payment_method etc.
      // due_date: dueDate?.toISOString() || null,
    };

    // Trigger the mutation
    updateMutation.mutate(
      {
        paymentId: paymentId, // Use the paymentId from props
        data: updatedData,
      },
      {
        onSuccess: (updatedPayment) => {
          // onSuccess logic (toast, cache invalidation) is handled by the hook's definition
          // No need to manually call onPaymentUpdated(updatedPayment);
          onClose(); // Close the modal on success
        },
        onError: (err) => {
          // onError logic (toast) is handled by the hook's definition
          console.error("Mutation error in payment modal:", err); // Log the error
          // Error toast is already shown by the hook's onError
        },
      }
    );
  };

  // Show loading state when fetching payment data initially
  if (isLoadingPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading payment details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state if fetching payment data failed
  if (fetchError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Payment</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fetchError.message}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render the form once payment data is loaded
  // payment is guaranteed to be non-null here due to the loading/error checks above
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {" "}
        {/* Adjust max-width as needed */}
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Edit details for payment ID: {payment?.payment_id || "N/A"}.{" "}
            {/* Display payment ID */}
          </DialogDescription>
        </DialogHeader>
        {/* Display mutation error if it exists */}
        {updateMutation.isError && updateMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            {/* Display the specific error message from the mutation hook */}
            <AlertDescription>{updateMutation.error.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 py-4">
          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-description" className="text-right">
              Description
            </Label>
            <Input
              id="payment-description"
              value={milestoneDescription}
              onChange={(e) => setMilestoneDescription(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting} // Disable while submitting
            />
          </div>

          {/* Amount Due */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-amount-due" className="text-right">
              {" "}
              {/* Changed ID */}
              Amount Due
            </Label>
            <Input
              id="payment-amount-due" // Changed ID
              type="number"
              value={amountDue}
              onChange={(e) => setAmountDue(Number(e.target.value))}
              className="col-span-3"
              disabled={isSubmitting} // Disable while submitting
            />
          </div>

          {/* Amount Paid */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-amount-paid" className="text-right">
              {" "}
              {/* New Field */}
              Amount Paid
            </Label>
            <Input
              id="payment-amount-paid" // New Field
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              className="col-span-3"
              disabled={isSubmitting} // Disable while submitting
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-status" className="text-right">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value: PaymentStatus) => setStatus(value)} // Cast value to PaymentStatus
              disabled={isSubmitting} // Disable while submitting
            >
              <SelectTrigger id="payment-status" className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {/* Map enum values to SelectItems */}
                {Object.values(PaymentStatus).map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    {statusValue.replace(/_/g, " ")} {/* Display with spaces */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add other editable fields here if needed */}
          {/* Example for Due Date (if editable) */}
          {/* <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="payment-due-date" className="text-right">Due Date</Label>
               // You'll need a date picker component here
               // <DatePicker id="payment-due-date" selected={dueDate} onChange={setDueDate} disabled={isSubmitting} className="col-span-3" />
            </div> */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
