// Suggested file: src/components/cases/CaseCommunicationsTab.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react"; // Added Loader2
import {
  ApiCommunication,
  CommunicationType,
  CreateCommunicationData,
  UpdateCommunicationData,
} from "@/types/types"; // Import necessary types and DTOs
import { formatDate } from "@/utils/formatters"; // Assuming this utility exists
import { toast } from "sonner"; // Import toast
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to get the current user ID
// Import the mutation hooks
import {
  useCreateCommunicationMutation,
  useUpdateCommunicationMutation,
  useDeleteCommunicationMutation,
  communicationKeys, // Import query keys for potential cache invalidation (though mutations handle this)
} from "@/hooks/useCommunications"; // Adjust path

interface CaseCommunicationsTabProps {
  communications: ApiCommunication[];
  caseId: string; // The ID of the case this tab is for
  isLoadingCommunications: boolean; // Prop to indicate if the initial communications list is loading
  // Removed onAddCommunication, onDeleteCommunication, onEditCommunication props
}

const CaseCommunicationsTab: React.FC<CaseCommunicationsTabProps> = ({
  communications,
  caseId,
  isLoadingCommunications, // Use this prop for initial loading state
}) => {
  const { user } = useAuth(); // Get the current authenticated user
  const [newMessage, setNewMessage] = useState("");
  // Use CommunicationType enum for messageType state
  const [messageType, setMessageType] = useState<CommunicationType>(
    CommunicationType.CASE
  ); // Default to CASE for case communications? Or ANNOUNCEMENT/CLIENT?

  const [editMode, setEditMode] = useState<{
    id: string; // communication_id
    content: string;
  } | null>(null);

  // Instantiate mutation hooks
  const createMutation = useCreateCommunicationMutation();
  const updateMutation = useUpdateCommunicationMutation();
  const deleteMutation = useDeleteCommunicationMutation();

  // Determine if any mutation is currently pending
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

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

  const startEdit = (comm: ApiCommunication) => {
    setEditMode({
      id: comm.communication_id, // Use correct PK
      content: comm.content,
    });
  };

  const cancelEdit = () => {
    setEditMode(null);
  };

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

  const handleDelete = async (comm: ApiCommunication) => {
    // Confirm deletion before proceeding
    if (window.confirm("Are you sure you want to delete this communication?")) {
      // Trigger the delete mutation
      deleteMutation.mutate(comm.communication_id, {
        // Pass the communication ID
        onSuccess: () => {
          // onSuccess logic (toast) is handled by the hook's definition
        },
        onError: (error) => {
          // onError logic (toast) is handled by the hook's definition
          console.error("Failed to delete communication:", error); // Log error
        },
      });
    }
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

  // Show loading state for initial data fetch
  if (isLoadingCommunications) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading communications...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Communications ({communications.length})
        </h3>
      </div>

      {/* New Message Input Section */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {" "}
          {/* Added space-y-4 */}
          {/* Select for message type */}
          <Select
            value={messageType}
            onValueChange={(value) =>
              setMessageType(value as CommunicationType)
            }
            disabled={isMutating} // Disable select while mutating
          >
            <SelectTrigger>
              <SelectValue placeholder="Message Type" />
            </SelectTrigger>
            <SelectContent>
              {/* Populate with relevant CommunicationType options */}
              {/* Assuming staff/users can send ANNOUNCEMENT, CASE, CLIENT, TASK types */}
              <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
              <SelectItem value="CASE">Case</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="TASK">Task</SelectItem>
              {/* Add other types from enum if applicable */}
            </SelectContent>
          </Select>
          {/* Textarea for message content */}
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px]"
            disabled={isMutating} // Disable input while mutating
          />
          {/* Send Message Button */}
          <Button
            onClick={handleSendMessage}
            className="w-full"
            disabled={!newMessage.trim() || isMutating} // Disable if empty or mutating
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Communications List */}
      <div className="space-y-4">
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
              key={comm.communication_id} // Use correct PK
              className={!comm.read ? "border-l-4 border-blue-500" : ""} // Highlight unread messages
            >
              <CardContent className="p-4">
                {editMode?.id === comm.communication_id ? ( // Use correct PK for comparison
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
                        setEditMode({ ...editMode, content: e.target.value })
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
                        {/* Using UserCircle as a fallback or default icon */}
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
                          {formatDate(comm.sent_at)}
                        </span>
                        {/* Edit Button - Only show if current user is the sender and not mutating */}
                        {user && comm.user_id === user.id && (
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
                        {user && comm.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleDelete(comm)} // Pass the full communication object
                            disabled={isMutating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Display communication content */}
                    <p className="text-gray-700">{comm.content}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CaseCommunicationsTab;
