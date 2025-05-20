// Suggested file: src/components/cases/CaseCommunicationsSection.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCircle,
  Send,
  Edit2,
  Trash2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Label } from "@/components/ui/label"; // Import Label
import { format } from "date-fns"; // Import format
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Import hooks and types
import {
  useCommunicationsQuery, // Use the general query hook with filters
  useCreateCommunicationMutation,
  useUpdateCommunicationMutation,
  useDeleteCommunicationMutation,
} from "@/hooks/useCommunications"; // Adjust path
import {
  ApiCommunication,
  CommunicationType,
  CreateCommunicationData,
  UpdateCommunicationData,
} from "@/types/types"; // Import types and DTOs
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"; // Assuming this exists

interface CaseCommunicationsSectionProps {
  caseId: string; // The ID of the case to fetch communications for
}

const CaseCommunicationsSection: React.FC<CaseCommunicationsSectionProps> = ({
  caseId,
}) => {
  const { user } = useAuth(); // Get the current authenticated user

  // Fetch communications for the specific case using the hook
  const {
    data: communications = [],
    isLoading: isLoadingCommunications,
    error,
  } = useCommunicationsQuery({ caseId });

  // Mutation hooks for communications
  const createMutation = useCreateCommunicationMutation();
  const updateMutation = useUpdateCommunicationMutation();
  const deleteMutation = useDeleteCommunicationMutation();

  // State for new message input
  const [newMessage, setNewMessage] = useState("");
  // Default message type for case communications
  const [messageType, setMessageType] = useState<CommunicationType>(
    CommunicationType.CASE
  ); // Default to CASE

  // State for managing edit mode
  const [editMode, setEditMode] = useState<{
    id: string; // communication_id
    content: string;
  } | null>(null);

  // State for managing delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [communicationToDelete, setCommunicationToDelete] =
    useState<ApiCommunication | null>(null);

  // Determine if any mutation is currently pending
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Handle error from the query
  if (error) {
    // The hook's onError already shows a toast, but you might want to render an error message here too
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            Error loading communications: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state from the query
  if (isLoadingCommunications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.warning("Message content cannot be empty.");
      return;
    }
    if (!user) {
      toast.error("User not authenticated. Cannot send message.");
      return;
    }

    // Prepare data for the create mutation using the DTO
    const data: CreateCommunicationData = {
      user_id: user.id,
      comm_type: messageType, // Use the selected type
      content: newMessage,
      case_id: caseId, // Link the communication to the current case
      company_id: null, // Not linked to a company directly via this modal
      task_id: null, // Not linked to a task directly via this modal
    };

    // Trigger the create mutation
    createMutation.mutate(data, {
      onSuccess: () => {
        // onSuccess logic (toast, state reset) is handled by the hook's definition
        setNewMessage(""); // Clear the input field on success
        // setMessageType("CASE"); // Optionally reset type
      },
      onError: (error) => {
        // onError logic (toast) is handled by the hook's definition
        console.error("Failed to create communication:", error); // Log error
      },
    });
  };

  // Handle starting edit mode for a communication
  const startEdit = (comm: ApiCommunication) => {
    setEditMode({
      id: comm.communication_id, // Use correct PK
      content: comm.content,
    });
  };

  // Handle canceling edit mode
  const cancelEdit = () => {
    setEditMode(null);
    // Reset the textarea content to the original message if needed,
    // but since we clear editMode, the display mode will show original content.
  };

  // Handle saving an edited communication
  const saveEdit = async () => {
    if (!editMode || !editMode.content.trim()) {
      toast.warning("Edited message content cannot be empty.");
      return;
    }

    // Prepare data for the update mutation using the DTO
    const updatedData: UpdateCommunicationData = {
      content: editMode.content,
      // Include other fields if they can be edited (e.g., read status, type)
      // read: comm.read, // If read status is editable
      // comm_type: comm.comm_type, // If type is editable
    };

    // Trigger the update mutation
    updateMutation.mutate(
      {
        communicationId: editMode.id,
        data: updatedData,
      },
      {
        onSuccess: () => {
          // onSuccess logic (toast, state reset) is handled by the hook's definition
          setEditMode(null); // Exit edit mode on success
        },
        onError: (error) => {
          // onError logic (toast) is handled by the hook's definition
          console.error("Failed to update communication:", error); // Log error
        },
      }
    );
  };

  // Handle clicking the delete button
  const handleDeleteClick = (comm: ApiCommunication) => {
    setCommunicationToDelete(comm);
    setDeleteDialogOpen(true);
  };

  // Handle confirming the delete action
  const handleDeleteConfirm = () => {
    if (!communicationToDelete) return;

    // Trigger the delete mutation
    deleteMutation.mutate(communicationToDelete.communication_id, {
      // Pass the communication ID
      onSuccess: () => {
        // Toast is handled by the hook's onSuccess
        setDeleteDialogOpen(false);
        setCommunicationToDelete(null);
      },
      onError: (error) => {
        // Toast is handled by the hook's onError
        setDeleteDialogOpen(false);
        setCommunicationToDelete(null);
      },
    });
  };

  // Helper function to get badge color based on CommunicationType enum
  const getCommTypeColor = (type: CommunicationType) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return "bg-blue-100 text-blue-800";
      case "CASE":
        return "bg-green-100 text-green-800";
      case "CLIENT":
        return "bg-purple-100 text-purple-800";
      case "TASK":
        return "bg-amber-100 text-amber-800";
      default:
        // Handle any other potential types or null
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to check if a sender's role is CLIENT
  const isClientRole = (role: string | null | undefined) => role === "CLIENT";

  // Helper to check if the current user is the sender of a communication
  const isCurrentUserSender = (comm: ApiCommunication) =>
    user && comm.user_id === user.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications ({communications.length})</CardTitle>{" "}
        {/* Display count */}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Communications List */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {" "}
            {/* Added max height and scroll */}
            {communications.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">
                  No communications found for this case.
                </p>
              </div>
            ) : (
              communications.map((comm) => (
                <Card
                  key={comm.communication_id}
                  className={!comm.read ? "border-l-4 border-blue-500" : ""}
                >
                  <CardContent className="p-4">
                    {editMode?.id === comm.communication_id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {/* Display sender info in edit mode */}
                            {comm.sender && (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>
                                    {comm.sender.full_name
                                      ? comm.sender.full_name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                      : "?"}
                                  </AvatarFallback>
                                  {/* Add AvatarImage if user profile pictures are available */}
                                  {/* <AvatarImage src={comm.sender.avatar_url} /> */}
                                </Avatar>
                                <span className="font-medium">
                                  {comm.sender.full_name || "Unknown User"}
                                </span>
                              </>
                            )}
                          </div>
                          {/* Display communication type badge */}
                          <Badge className={getCommTypeColor(comm.comm_type)}>
                            {comm.comm_type.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        {/* Textarea for editing content */}
                        <Textarea
                          value={editMode.content}
                          onChange={(e) =>
                            setEditMode({
                              ...editMode,
                              content: e.target.value,
                            })
                          }
                          className="min-h-[100px]"
                          disabled={isMutating} // Disable input while mutating
                        />

                        {/* Edit Action Buttons */}
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            disabled={isMutating}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={!editMode.content.trim() || isMutating}
                          >
                            {updateMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* Display sender info */}
                            {comm.sender ? (
                              <UserCircle
                                className={`h-6 w-6 ${
                                  isClientRole(comm.sender.role)
                                    ? "text-blue-500"
                                    : "text-slate-500"
                                }`}
                              />
                            ) : (
                              <UserCircle className="h-6 w-6 text-muted-foreground" />
                            )}
                            <span className="font-medium">
                              {comm.sender?.full_name || "Unknown User"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Display communication type badge */}
                            <Badge className={getCommTypeColor(comm.comm_type)}>
                              {comm.comm_type.replace(/_/g, " ")}
                            </Badge>
                            {/* Display sent date */}
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(comm.sent_at),
                                "MMM dd, yyyy hh:mm a"
                              )}
                            </span>
                            {/* Edit Button - Only show if current user is the sender and not mutating */}
                            {isCurrentUserSender(comm) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => startEdit(comm)} // Pass the full communication object
                                disabled={isMutating}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Delete Button - Only show if current user is the sender and not mutating */}
                            {isCurrentUserSender(comm) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteClick(comm)} // Pass the full communication object
                                disabled={isMutating}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* Display communication content */}
                        <p className="text-gray-700">{comm.content}</p>
                        {/* Mark as Read Button - Only show if NOT sent by current user AND NOT read */}
                        {user && comm.user_id !== user.id && !comm.read && (
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() =>
                                updateMutation.mutate({
                                  communicationId: comm.communication_id,
                                  data: { read: true },
                                })
                              }
                              disabled={isMutating}
                            >
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Separator />

          {/* New Communication Input */}
          <div>
            <Label htmlFor="communication">New Communication</Label>
            <div className="flex space-x-2">
              <Textarea
                id="communication"
                placeholder="Enter your message here"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow"
                disabled={isMutating} // Disable input while mutating
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isMutating}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      {communicationToDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Communication"
          description={`Are you sure you want to delete this communication? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      )}
    </Card>
  );
};

export default CaseCommunicationsSection;
