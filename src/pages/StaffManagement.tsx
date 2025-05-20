// Suggested file: src/pages/StaffManagement.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { UserProfile, UserRole } from "@/types/types";
import UserCard from "@/components/users/UserCard";
import { UserActions } from "@/components/users/UserActions";
import { UserEditModal } from "@/components/users/UserEditModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUsersQuery, useDeleteUserMutation } from "@/hooks/useUsers";

const StaffManagement = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const {
    data: staffMembers = [],
    isLoading: isLoadingStaff,
    error: staffError,
  } = useUsersQuery({ role: { not: UserRole.CLIENT } });

  const deleteMutation = useDeleteUserMutation();
  const isDeleting = deleteMutation.isPending;

  useEffect(() => {
    if (staffError) {
      toast.error("Staff Data Error", { description: staffError.message });
    }
  }, [staffError]);

  // Change the handleEditUser function to:
  const handleEditUser = (user: UserProfile) => {
    if (!user?.id) {
      toast.error("Invalid user selected");
      return;
    }
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUserClick = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(
      {
        userId: userToDelete.id,
        isClient: userToDelete.role === UserRole.CLIENT,
      },
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
          if (selectedUser?.id === userToDelete.id) {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }
        },
        onError: (error) => {
          console.error("Error confirming delete:", error);
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        },
      }
    );
  };

  const handleSendResetPassword = async (email: string) => {
    console.log(`Attempting to send reset password email to ${email}`);
    toast.info(`Password reset email sent to ${email} (Placeholder)`);
  };

  const filteredStaff = staffMembers.filter(
    (member) =>
      (member.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (member.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingStaff) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-lg text-muted-foreground">
          Loading staff data...
        </span>
      </div>
    );
  }

  if (staffError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {staffError?.message || "Failed to load staff data."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Staff Management</h1>
        <p className="text-muted-foreground">
          Manage staff members and their roles - Talha Khan. Contact:
          442-421-5593 | info@dijitze.com
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search staff members by name, email, or role..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoadingStaff}
          />
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm
              ? `No staff members match your search for "${searchTerm}".`
              : "No staff members to display."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div key={staff.id} className="relative">
              <UserCard user={staff} onClick={() => handleEditUser(staff)} />
              <div className="absolute top-2 right-2 z-10">
                <UserActions
                  user={staff}
                  onDelete={() => handleDeleteUserClick(staff)}
                  onEditProfile={() => handleEditUser(staff)}
                  onSendResetPassword={handleSendResetPassword}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update the UserEditModal component usage: */}
      {selectedUser?.id && (
        <UserEditModal
          userId={selectedUser.id}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Staff Member"
        description={`Are you sure you want to delete staff member "${
          userToDelete?.full_name || userToDelete?.email || "this user"
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteUser}
        variant="destructive"
      >
        {userToDelete && (
          <div className="py-4">
            <p className="font-medium">
              {userToDelete.full_name || userToDelete.email}
            </p>
            {userToDelete.role && (
              <p className="text-muted-foreground text-sm mt-1">
                Role: {userToDelete.role.replace(/_/g, " ")}
              </p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default StaffManagement;
