// Suggested file: src/views/StaffManagement.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react"; // Added Loader2, AlertCircle
import { toast } from "sonner";
// Removed direct API calls: getUsers, deleteUser, hasPermission
import { UserProfile, UserRole } from "@/types/types"; // Assuming UserProfile and UserRole types are in types/api
import UserCard from "@/components/users/UserCard"; // Your refined UserCard component
import { UserActions } from "@/components/users/UserActions"; // Your enhanced UserActions component
import { UserEditModal } from "@/components/users/UserEditModal"; // Import the UserEditModal component
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"; // Assuming you have a ConfirmationDialog component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import react-query hooks
import {
  useUsersQuery, // Hook to fetch users (will use for staff)
  useDeleteUserMutation, // Hook for deleting users
  useUserPermissionsQuery, // Hook to fetch current user's permissions
} from "@/hooks/useUsers"; // Adjust path to your user hooks file

const ClientManagement = () => {
  // --- State Management ---
  // State for the user being edited or viewed (null for create mode)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // State for modal and dialog visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // State for the user currently targeted for deletion
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // --- Data Fetching using Hooks ---
  // Fetch staff members (users with roles CLIENT)
  // The hook handles loading, caching, and refetching
  const {
    data: staffMembers = [], // Default to empty array while loading
    isLoading: isLoadingStaff, // Boolean loading state
    error: staffError, // Error object if fetch fails
  } = useUsersQuery({ role: UserRole.CLIENT }); // Use the filter to get non-client users

  // --- Mutation Hooks ---
  // Hook for deleting users
  const deleteMutation = useDeleteUserMutation();
  // Boolean loading state for the delete mutation
  const isDeleting = deleteMutation.isPending;

  // --- Error Handling ---
  // Use useEffect to show toast notifications when fetch errors occur
  useEffect(() => {
    if (staffError) {
      toast.error("Staff Data Error", { description: staffError.message });
    }

    // Mutation errors (create, update, delete) are handled within their respective mutation hooks' onError callbacks
  }, [staffError]); // Effect runs when staffError or permissionsError changes

  // --- Handlers ---

  // Handler to open the edit modal for an existing user
  const handleEditUser = (user: UserProfile) => {
    // Check if the user has permission to edit before opening the modal
    // Set the selected user and open the edit modal
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Handler to open the modal for adding a new staff member
  const handleAddStaffClick = () => {
    // Set selectedUser to null to indicate the modal should be in "create" mode
    setSelectedUser(null);
    // Open the edit modal (assuming it handles both create and edit based on selectedUser being null or not)
    setIsEditModalOpen(true);
  };

  // Handler for initiating the delete action (opens the confirmation dialog)
  const handleDeleteUserClick = (user: UserProfile) => {
    // Set the user to be deleted and open the confirmation dialog
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handler for confirming the delete action (triggers the delete mutation)
  const confirmDeleteUser = () => {
    // Ensure there is a user selected for deletion
    if (!userToDelete) return;

    // Trigger the delete mutation provided by the hook
    // The hook's onSuccess and onError callbacks handle toast notifications and cache invalidation.
    deleteMutation.mutate(
      {
        userId: userToDelete.id, // Pass the ID of the user to delete
        isClient: userToDelete.role === UserRole.CLIENT, // Pass if the user is a client (might be needed by the API function)
      },
      {
        onSuccess: () => {
          // Close the confirmation dialog on successful deletion
          setIsDeleteDialogOpen(false);
          // Clear the user to delete state
          setUserToDelete(null);
          // If the user being deleted was also selected for editing, close the edit modal too
          if (selectedUser?.id === userToDelete.id) {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }
          // The mutation hook's cache invalidation will automatically update the staff list.
        },
        onError: (error) => {
          // The mutation hook's onError already shows a toast.
          console.error("Error confirming delete:", error); // Log the error for debugging
          // Close the dialog on error
          setIsDeleteDialogOpen(false);
          // Clear the user to delete state
          setUserToDelete(null);
        },
      }
    );
  };

  // Handler for when a user is updated in the modal (Optional)
  // If your UserEditModal uses the useUpdateUserProfileMutation hook internally,
  // this handler is likely redundant because the hook's onSuccess should handle cache invalidation
  // which will cause the staff list to refetch or update automatically.
  // If your modal still uses a prop to signal updates, keep this handler and implement cache invalidation here.
  // const handleUserUpdated = (updatedUser: UserProfile) => {
  //   // Example of manual cache invalidation if the hook doesn't do it:
  //   // queryClient.invalidateQueries({ queryKey: userKeys.lists({ role: { not: UserRole.CLIENT } }) });
  //   // Example of manually updating the specific user in the cache (less common for lists):
  //   // queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
  // };

  // Handler for sending password reset email (Placeholder - should be implemented or passed down)
  // This function would likely trigger a separate mutation or API call.
  const handleSendResetPassword = async (email: string) => {
    // Implement the logic to send a password reset email
    // This might involve a new API function and a corresponding mutation hook.
    console.log(`Attempting to send reset password email to ${email}`);
    toast.info(`Password reset email sent to ${email} (Placeholder)`); // Placeholder toast
    // Example: useSendPasswordResetMutation.mutate(email);
  };

  // --- Filtering ---
  // Filter the staff members based on the search term entered by the user.
  // Handles potential null/undefined full_name, email, and role for robustness.
  const filteredStaff = staffMembers.filter(
    (member) =>
      (member.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (member.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || // Also search by email
      (member.role || "").toLowerCase().includes(searchTerm.toLowerCase()) // Also search by role
  );

  // --- Render Logic ---

  // Show a loading spinner while the initial staff data or permissions are being fetched
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

  // Show an error message if the initial staff data or permissions fetch failed
  if (staffError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {/* Display the specific error message from the hook */}
            {staffError?.message || "Failed to load staff data."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render the main content once data is loaded and no errors occurred
  return (
    <>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Client Management</h1>
          <p className="text-muted-foreground">
            Manage client members and their roles - Talha Khan. Contact:
            442-421-5593 | info@dijitze.com
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleAddStaffClick} // Call the handler to open the modal in create mode
        >
          <span>New Staff Member</span>
        </Button>
      </div>

      {/* Search Input Section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {" "}
        {/* Use flex-col/md:flex-row for responsiveness */}
        <div className="relative flex-1">
          {" "}
          {/* Flex-1 allows the input to grow */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search staff members by name, email, or role..." // More descriptive placeholder
            className="pl-10" // Add left padding for the search icon
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoadingStaff} // Disable search while staff are loading
          />
        </div>
        {/* Add other filter/sort controls here if needed */}
      </div>

      {/* Display staff members list */}
      {/* Conditional rendering based on filtered results */}
      {filteredStaff.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            {/* Display different messages based on whether there's a search term */}
            {searchTerm
              ? `No staff members match your search for "${searchTerm}".`
              : "No staff members to display."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {" "}
          {/* Responsive grid for cards */}
          {/* Map over the filtered staff members to render UserCard components */}
          {filteredStaff.map((staff) => (
            <div key={staff.id} className="relative">
              {" "}
              {/* Wrap card in a relative div for absolute positioning of actions */}
              <UserCard
                user={staff} // Pass the full user data object
                // Pass a click handler to open the edit modal when the card is clicked
                onClick={() => handleEditUser(staff)}
              />
              {/* User Actions Dropdown - positioned absolutely */}
              <div className="absolute top-2 right-2 z-10">
                {" "}
                {/* Position top-right with z-index */}
                <UserActions
                  user={staff} // Pass the user data to UserActions
                  onDelete={() => handleDeleteUserClick(staff)} // Pass handler to initiate delete
                  onEditProfile={() => handleEditUser(staff)} // Pass handler to open edit modal
                  // Pass individual permissions to UserActions if it needs them for conditional rendering of its items
                  onSendResetPassword={handleSendResetPassword} // Pass the handler for reset password
                  // isClient prop is not needed here as this page only shows staff
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Edit/Create Modal */}
      {/* Render the modal. Its visibility is controlled by isEditModalOpen. */}
      {/* It fetches/updates data based on the passed userId and handles its own loading/error states internally. */}
      <UserEditModal
        userId={selectedUser?.id} // Pass the selected user's ID (null for create mode)
        isOpen={isEditModalOpen} // Control modal visibility
        onClose={() => {
          // Custom onClose handler to close the modal and clear the selected user state
          setIsEditModalOpen(false);
          setSelectedUser(null); // Clear selected user when modal closes
        }}
        // onUserUpdated prop is likely redundant if modal uses mutation hook
        // and hook's onSuccess invalidates cache. Remove if so.
        // onUserUpdated={handleUserUpdated}
      />

      {/* Delete Confirmation Dialog */}
      {/* Render the confirmation dialog. Its visibility is controlled by isDeleteDialogOpen. */}
      <ConfirmationDialog
        open={isDeleteDialogOpen} // Control dialog visibility
        onOpenChange={setIsDeleteDialogOpen} // Allows closing via overlay click or Escape key
        title="Delete Staff Member"
        // Display a descriptive message including the user's name or email
        description={`Are you sure you want to delete staff member "${
          userToDelete?.full_name || userToDelete?.email || "this user"
        }"? This action cannot be undone.`}
        confirmLabel="Delete" // Text for the confirm button
        cancelLabel="Cancel" // Text for the cancel button
        onConfirm={confirmDeleteUser} // Call the mutation handler when confirm is clicked
        variant="destructive" // Use destructive styling for the confirm button
      >
        {/* Optional content inside the dialog body */}
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
    </>
  );
};

export default ClientManagement;
