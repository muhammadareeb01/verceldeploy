// Suggested file: src/views/Communications.tsx
// (Assuming this is the Staff/Admin view component)
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
// Use standard Tanstack Query hook naming conventions (with 'use' prefix)
import {
  useCommunicationsQuery, // Corrected import: Added 'use' prefix back
  communicationKeys,
  useCreateCommunicationMutation,
  useUpdateCommunicationMutation,
  useDeleteCommunicationMutation,
} from "@/hooks/useCommunications"; // Adjust path
import { useCasesQuery } from "@/hooks/useCases"; // Adjust path
import { useCompaniesQuery } from "@/hooks/useCompanies"; // Adjust path - Ensure useCompaniesQuery is imported from here

import StaffNewCommunicationModal from "@/components/communications/StaffNewCommunicationModal";
import CommunicationsList from "@/components/communications/CommunicationsList";
import CommunicationsSidebar from "@/components/communications/CommunicationsSidebar";
// Removed direct supabase import
import { toast } from "sonner"; // Keep sonner
import {
  ApiCase,
  ApiCompanySummary,
  CommunicationType,
  ApiCommunication,
  CreateCommunicationData,
  UpdateCommunicationData,
} from "@/types/types";
import { useTaskInstancesQuery } from "@/hooks/useTasks";
// Removed unused ApiClient import

// Define types for the sidebar data structures prepared in this component
// These match the expected props of the CommunicationsSidebar component

const Communications: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<
    "general" | "case" | "company" | "task"
  >("general");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined); // This is the ID of the selected case or company

  // Fetch data for sidebar and communication filtering
  // Use the query hooks directly with standard naming
  const { data: allCases = [], isLoading: isCasesLoading } = useCasesQuery();
  const { data: allTasks = [], isLoading: isTasksLoading } =
    useTaskInstancesQuery({ assignedToUserId: user?.id });
  const { data: allCompanies = [], isLoading: isCompaniesLoading } =
    useCompaniesQuery();

  // Fetch communications based on selected tab and ID
  // Pass filters object to the main communicationsQuery hook
  const communicationFilters = {
    caseId: selectedTab === "case" ? selectedId : undefined,
    companyId: selectedTab === "company" ? selectedId : undefined,
    general: selectedTab === "general" ? true : undefined,
    // Add other filters like taskId, userId if needed for sidebar/main view
  };
  const { data: communications = [], isLoading: isCommunicationsLoading } =
    useCommunicationsQuery(communicationFilters);

  // Use the mutation hooks
  const createMutation = useCreateCommunicationMutation();
  const updateMutation = useUpdateCommunicationMutation();
  const deleteMutation = useDeleteCommunicationMutation();

  const handleSendMessage = async (
    content: string,
    type: CommunicationType,
    relatedType: "company" | "case" | "task" | "general", // Added task/general types if StaffNewCommunicationModal supports them
    relatedId?: string // relatedId is company_id, case_id, or task_id
  ) => {
    if (!user) {
      toast.error(
        "User not authenticated. Contact Talha Khan at 442-421-5593 or info@dijitze.com."
      );
      return;
    }

    // Map the relatedType and relatedId to the correct DTO structure
    const data: CreateCommunicationData = {
      user_id: user.id,
      comm_type: type,
      content,
      case_id: relatedType === "case" ? relatedId : null,
      company_id: relatedType === "company" ? relatedId : null,
      task_id: relatedType === "task" ? relatedId : null,
      // If relatedType is "general", case_id, company_id, task_id should all be null/undefined,
      // which is handled by setting null explicitly above or letting them be undefined.
    };

    // Remove the redundant supabase call to fetch company by relatedId
    // The relatedId passed from the modal should already be the correct entity ID.

    createMutation.mutate(data);
  };

  const handleEdit = (comm: ApiCommunication) => {
    // Open a modal or form to edit the communication content/type
    // For simplicity, this example just shows how the mutation would be called
    // In a real app, you'd likely populate an edit form first.
    const updatedData: UpdateCommunicationData = {
      // Assuming only content and maybe type are editable
      content: comm.content, // Get updated content from an edit form
      comm_type: comm.comm_type, // Get updated type
      read: comm.read, // Keep existing read status unless also editable
    };
    // You'd need to get the actual updated data from user input
    // For now, just showing the mutation call structure
    // updateMutation.mutate({ communicationId: comm.communication_id, data: updatedData });
    toast.info(
      `Edit communication "${comm.communication_id}" - Implementation needed.`
    );
  };

  const handleDelete = (comm: ApiCommunication) => {
    // Confirm deletion then call mutation
    if (window.confirm("Are you sure you want to delete this communication?")) {
      deleteMutation.mutate(comm.communication_id);
    }
  };

  const handleSelectTab = (
    tab: "general" | "case" | "company",
    id?: string
  ) => {
    setSelectedTab(tab);
    setSelectedId(id);
  };

  // CommunicationsList component handles its own loading state now based on the 'communications' prop's source hook
  // Grouping logic can be simplified or moved if the hook provides pre-filtered data
  // Since communicationsQuery takes filters, we get the relevant list directly, no manual grouping needed here based on selectedTab/ID
  const filteredCommunications = communications; // communications hook already provides the filtered list

  return (
    <div className="h-screen p-1">
      <div className="flex justify-end">
        <StaffNewCommunicationModal
          onSend={handleSendMessage}
          cases={allCases} // Pass all cases to the modal for selection (full ApiCase[] needed here for details like service name)
          companies={allCompanies} // Pass all companies to modal (full ApiCompanySummary[] needed)
          isLoading={createMutation.isPending}
          tasks={allTasks}
        />
      </div>
      <CommunicationsSidebar
        cases={allCases} // Pass the simplified SidebarCaseItem[] array
        companies={allCompanies} // Pass the simplified SidebarCompanyItem[] array
      />
    </div>
  );
};

export default Communications;
