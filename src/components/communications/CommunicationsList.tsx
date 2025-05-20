// Suggested file: src/components/communications/CommunicationsList.tsx
import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Edit2, Trash2 } from "lucide-react"; // Removed MessageSquare, Eye imports if not used
import { ApiCommunication, CommunicationType } from "@/types/types"; // Use types from your file
import { formatDate } from "@/utils/formatters"; // Assuming this utility exists
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query"; // Keep useQueryClient
// Use the specific update mutation hook
import {
  useUpdateCommunicationMutation,
  communicationKeys,
} from "@/hooks/useCommunications"; // Adjust path

// Props for the main component
interface CommunicationsListProps {
  communications: ApiCommunication[];
  isLoading: boolean;
  onEdit: (comm: ApiCommunication) => void; // Pass the full communication object
  onDelete: (comm: ApiCommunication) => void; // Pass the full communication object
  // Add a prop to control if actions (edit/delete) should be shown, regardless of sender
  disableActions?: boolean;
}

// Sub-component: Sender Information
const SenderInfo: React.FC<{
  sender: ApiCommunication["sender"];
  isClient: boolean;
}> = ({ sender, isClient }) => (
  <div className="flex items-center gap-2">
    <UserCircle
      className={`h-6 w-6 ${isClient ? "text-blue-500" : "text-slate-500"}`}
    />
    <span className="font-medium">{sender?.full_name || "Unknown User"}</span>
  </div>
);

// Sub-component: Communication Badges
const CommunicationBadges: React.FC<{
  caseId?: string | null;
  companyId?: string | null;
  taskId?: string | null; // Added task_id based on schema
  commType: CommunicationType;
  read: boolean;
}> = ({ caseId, companyId, taskId, commType, read }) => {
  const getCommTypeColor = (type: CommunicationType) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return "bg-blue-100 text-blue-800";
      case "CASE":
        return "bg-green-100 text-green-800";
      case "CLIENT": // Assuming CLIENT comm type refers to a client-initiated message
        return "bg-purple-100 text-purple-800";
      case "TASK":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Display badges for linked entities */}
      {caseId && (
        <Badge variant="outline" className="text-blue-500">
          Case
        </Badge>
      )}
      {companyId && (
        <Badge variant="outline" className="text-green-500">
          Company
        </Badge>
      )}
      {taskId && (
        <Badge variant="outline" className="text-amber-500">
          Task
        </Badge>
      )}
      {/* Display the communication type */}
      <Badge className={getCommTypeColor(commType)}>
        {commType.replace(/_/g, " ")}
      </Badge>
      {/* Display read status */}
      <Badge variant={read ? "secondary" : "destructive"}>
        {read ? "Read" : "Unread"}
      </Badge>
    </div>
  );
};

// Sub-component: Communication Actions
const CommunicationActions: React.FC<{
  comm: ApiCommunication;
  onEdit: (comm: ApiCommunication) => void;
  onDelete: (comm: ApiCommunication) => void;
  isSender: boolean;
  disableActions?: boolean; // Use this prop to hide actions
}> = ({ comm, onEdit, onDelete, isSender, disableActions }) => {
  if (!isSender || disableActions) {
    // Only show actions if the current user is the sender AND actions are not disabled
    return (
      <span className="text-xs text-gray-500">{formatDate(comm.sent_at)}</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{formatDate(comm.sent_at)}</span>
      {/* Only show edit/delete if user is sender and actions are enabled */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onEdit(comm)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-500"
        onClick={() => onDelete(comm)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Sub-component: Single Communication Item
const CommunicationItem: React.FC<{
  comm: ApiCommunication;
  onEdit: (comm: ApiCommunication) => void;
  onDelete: (comm: ApiCommunication) => void;
  currentUserId?: string;
  isClient: boolean; // Flag to indicate if the current user has the CLIENT role
  disableActions?: boolean; // Pass down the disableActions prop
}> = ({ comm, onEdit, onDelete, currentUserId, isClient, disableActions }) => {
  const queryClient = useQueryClient();
  const isSender = currentUserId && comm.user_id === currentUserId;

  // Use the hook for updating communications
  const markReadMutation = useUpdateCommunicationMutation();

  useEffect(() => {
    // Mark as read if the current user is a client and the communication is unread
    // And the communication is NOT sent by the current user (clients don't mark their own sent messages as read)
    if (isClient && !comm.read && comm.user_id !== currentUserId) {
      // Call the mutation function
      markReadMutation.mutate({
        communicationId: comm.communication_id,
        data: { read: true },
      });
    }
  }, [
    isClient,
    comm.read,
    comm.communication_id,
    comm.user_id,
    currentUserId,
    markReadMutation,
  ]); // Added dependencies

  return (
    <Card className={`border ${comm.read ? "" : "bg-gray-50"}  `}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2">
          <SenderInfo
            sender={comm.sender}
            isClient={comm.sender?.role === "CLIENT"} // Check sender's role, not current user's
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <CommunicationBadges
              caseId={comm.case_id}
              companyId={comm.company_id}
              taskId={comm.task_id} // Pass task_id to badges
              commType={comm.comm_type}
              read={comm.read}
            />
            <CommunicationActions
              comm={comm}
              onEdit={onEdit}
              onDelete={onDelete}
              isSender={!!isSender}
              disableActions={disableActions} // Pass down the prop
            />
          </div>
        </div>
        <p className="text-gray-700">{comm.content}</p>
      </CardContent>
    </Card>
  );
};

// Main Component
const CommunicationsList: React.FC<CommunicationsListProps> = ({
  communications,
  isLoading,
  onEdit,
  onDelete,
  disableActions, // Receive the prop
}) => {
  const { user } = useAuth();
  // Determine if the current user has the CLIENT role
  const isClient = user?.role === "CLIENT";

  if (isLoading) {
    return (
      <div className="text-center py-8">
        {/* Removed MessageSquare, assuming a shared spinner component or simple text */}
        <div className="animate-spin mx-auto mb-3 text-muted-foreground opacity-50">
          <svg
            className="h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-muted-foreground">Loading communications...</p>
      </div>
    );
  }

  if (!communications || communications.length === 0) {
    return (
      <div className="text-center py-8">
        {/* Removed MessageSquare, assuming a shared empty state component or simple text/icon */}
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.913 9.913 0 01-3.981-.815F7.001 16.933 10.125 15 12 15c2.071 0 4.047.746 5.581 2.031A7.958 7.958 0 0021 12zM13 2.05C18.48 3.065 22 6.812 22 12c0 2.616-1.274 4.964-3.29 6.533-1.183-.947-2.523-1.702-4.108-2.381C13.1 15.118 12.5 15 12 15s-1.1.118-1.602.382c-1.585.679-2.925 1.434-4.108 2.381C3.274 16.964 2 14.616 2 12c0-5.188 3.52-8.935 8-9.95M8 7h8"
          ></path>
        </svg>
        <p className="mt-2 text-muted-foreground">No messages found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <CommunicationItem
          key={comm.communication_id} // Use correct PK from schema
          comm={comm}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUserId={user?.id}
          isClient={isClient} // Pass the current user's role status
          disableActions={disableActions} // Pass the prop down
        />
      ))}
    </div>
  );
};

export default CommunicationsList;
