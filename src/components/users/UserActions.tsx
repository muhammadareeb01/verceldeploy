import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash,
  Edit,
  UserCheck,
  Mail,
  KeyRound,
} from "lucide-react"; // Added Mail and KeyRound icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile, UserRole } from "@/types/types"; // Assuming UserProfile and UserRole types
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"; // Assuming ConfirmationDialog component
import { hasPermission } from "@/api/users"; // Assuming hasPermission API call
import { supabase } from "@/integrations/supabase/client"; // Import supabase for password reset
import { toast } from "sonner"; // Import toast for notifications

interface UserActionsProps {
  user: UserProfile;
  onDelete: () => void;
  onEditProfile: () => void; // New prop for editing profile (opens modal)
  // onEditRole: () => void; // Removed or kept for separate role edit if needed
  isClient?: boolean;
  onSendResetPassword?: (email: string) => Promise<void>; // New optional prop for sending reset email
}

export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onDelete,
  onEditProfile, // Use this to trigger the edit modal
  // onEditRole, // Keep if you want a separate role edit action
  isClient = false,
  onSendResetPassword, // Destructure the new prop
}) => {
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false); // Permission to edit profile/role
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      const permissionsPromises = [
        hasPermission(isClient ? "delete_clients" : "delete_staff"),
        // Check for general edit permission (could be 'edit_users' or specific roles)
        // Assuming 'edit_staff' or 'edit_clients' covers general profile editing
        hasPermission(isClient ? "edit_clients" : "edit_staff"),
        // You might need a separate permission check for 'change_roles' if it's distinct
        // hasPermission("change_roles"),
      ];

      const [deletePermission, editPermission] = await Promise.all(
        permissionsPromises
      );

      setCanDelete(deletePermission);
      setCanEdit(editPermission); // Use editPermission for enabling edit actions
      // If you have a separate 'canChangeRoles' state, set it here too
    };

    // Only load permissions if user is not null (context provides user)
    // Assuming this component is only rendered for authenticated users
    loadPermissions();
  }, [isClient]); // Re-run when isClient changes

  // Internal handler for sending reset password email if prop is not provided
  const handleSendResetPasswordInternal = async () => {
    if (!user?.email) {
      toast.error("User email is not available.");
      return;
    }
    setIsSendingResetEmail(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`, // Ensure this matches your reset password page
      });

      if (error) throw error;

      toast.success(`Password reset email sent to ${user.email}.`);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast.error("Failed to send password reset email", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Decide which handler to use for sending reset password email
  const sendResetPasswordHandler =
    onSendResetPassword || handleSendResetPasswordInternal;

  // Ensure no stray characters or incomplete statements before the return
  return (
    <>
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
          {/* Edit Profile Action (opens modal) */}
          <DropdownMenuItem
            onClick={onEditProfile} // Call the prop handler to open the modal
            disabled={!canEdit} // Disable if user doesn't have edit permission
            className={!canEdit ? "text-muted-foreground" : ""}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          {/* Send Reset Password Email Action */}
          {user?.email && ( // Only show if user has an email
            <DropdownMenuItem
              onClick={() => sendResetPasswordHandler(user.email || "")} // CORRECTED: Wrap in anonymous function
              disabled={isSendingResetEmail} // Disable while sending
            >
              <KeyRound className="mr-2 h-4 w-4" />{" "}
              {/* Changed icon to KeyRound */}
              {isSendingResetEmail ? "Sending..." : "Send Reset Password"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator /> {/* Separator before delete */}
          {/* Delete User Action */}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!canDelete} // Disable if user doesn't have delete permission
            className={
              !canDelete ? "text-muted-foreground" : "text-destructive"
            }
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${
          user.full_name || user.email || "this user"
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={onDelete} // Use the prop handler for delete
        variant="destructive"
      />
    </>
  );
};
