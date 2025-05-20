// Suggested file: src/components/client-dashboard/ClientCaseTabs.tsx
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientCase, CaseStatus } from "@/types/types"; // Adjust path to your types file

interface ClientCaseTabsProps {
  clientCases: ClientCase[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ClientCaseTabs: React.FC<ClientCaseTabsProps> = ({
  clientCases,
  activeTab,
  setActiveTab,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList>
        <TabsTrigger value="all">All Cases ({clientCases.length})</TabsTrigger>
        <TabsTrigger value="in_progress">
          In Progress (
          {
            clientCases.filter((c) => c.case_status === CaseStatus.IN_PROGRESS)
              .length
          }
          )
        </TabsTrigger>
        <TabsTrigger value="not_started">
          Not Started (
          {
            clientCases.filter((c) => c.case_status === CaseStatus.NOT_STARTED)
              .length
          }
          )
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed (
          {
            clientCases.filter((c) => c.case_status === CaseStatus.COMPLETED)
              .length
          }
          )
        </TabsTrigger>
        {/* Add tabs for other statuses if needed */}
        {/* <TabsTrigger value="on_hold">On Hold ({clientCases.filter(c => c.case_status === CaseStatus.ON_HOLD).length})</TabsTrigger> */}
        {/* <TabsTrigger value="cancelled">Cancelled ({clientCases.filter(c => c.case_status === CaseStatus.CANCELLED).length})</TabsTrigger> */}
      </TabsList>
    </Tabs>
  );
};
