// src/pages/Cases/Cases.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCasesQuery } from "@/hooks/useCases";
import { useDocumentsQuery } from "@/hooks/useDocuments";
import { useQuery } from "@tanstack/react-query";
import { getServiceById } from "@/api/services";
import { getTaskInstancesCountByFilters   } from "@/api/tasks";
import { getDocumentsCount, getPendingDocumentsCount } from "@/api/documents";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { ApiCase, Service, CaseStatus, ClientCase } from "@/types/types";
import type { ApiDocument } from "@/types/documents";

// Import components
import { ClientDashboardHeader } from "@/components/client-dashboard/ClientDashboardHeader";
import { ClientDashboardError } from "@/components/client-dashboard/ClientDashboardError";
import { ClientDashboardLoading } from "@/components/client-dashboard/ClientDashboardLoading";
import { ClientDashboardNoCases } from "@/components/client-dashboard/ClientDashboardNoCases";
import { ClientCaseTabs } from "@/components/client-dashboard/ClientCaseTabs";
import { ClientCaseGrid } from "@/components/client-dashboard/ClientCaseGrid";
import CompanyDocumentsSection from "@/components/companies/CompanyDocumentsSection";
import HeaderActions from "@/components/layout/HeaderActions";

// Define status colors and icons
const statusColors: Record<CaseStatus, string> = {
  NOT_STARTED: "bg-gray-200 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusIcons: Record<CaseStatus, JSX.Element> = {
  NOT_STARTED: <Clock className="h-4 w-4 mr-1" />,
  IN_PROGRESS: <Clock className="h-4 w-4 mr-1" />,
  COMPLETED: <CheckCircle className="h-4 w-4 mr-1" />,
  ON_HOLD: <AlertCircle className="h-4 w-4 mr-1" />,
  CANCELLED: <AlertCircle className="h-4 w-4 mr-1" />,
};

const Cases = () => {
  const { user, isLoading: isLoadingUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch cases for the user
  const {
    data: cases,
    isLoading: isLoadingCases,
    error: casesError,
  } = useCasesQuery();

  // Fetch documents for the user
  const {
    data: documents = [],
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useDocumentsQuery({ caseId: user?.id });

  // Enrich cases with service details and counts
  const enrichedCasesQuery = useQuery<ClientCase[], Error>({
    queryKey: ["casesEnriched", cases, user?.id],
    queryFn: async () => {
      if (!cases || !user) return [];

      const casesWithDetails = await Promise.all(
        cases.map(async (caseItem) => {
          const service = await getServiceById(caseItem.service_id);
          const tasksCount = await getTaskInstancesCountByFilters({
            caseId: caseItem.case_id,
          });
          const documentsCount = await getDocumentsCount(caseItem.case_id);
          const pendingDocsCount = await getPendingDocumentsCount(
            caseItem.case_id
          );

          return {
            ...caseItem,
            service: service || null,
            tasks_count: tasksCount,
            documents_count: documentsCount,
            pending_documents: pendingDocsCount,
          } as ClientCase;
        })
      );

      return casesWithDetails;
    },
    enabled: !!cases && !isLoadingCases && !!user,
    staleTime: 1000 * 60 * 5,
  });

  const clientCases = useMemo(
    () => enrichedCasesQuery.data || [],
    [enrichedCasesQuery.data]
  );
  const isLoadingEnrichedCases = enrichedCasesQuery.isLoading;
  const enrichedCasesError = enrichedCasesQuery.error;

  // Combined loading and error states
  const isLoading =
    isLoadingUser ||
    isLoadingCases ||
    isLoadingEnrichedCases ||
    isLoadingDocuments;

  const error = casesError || enrichedCasesError || documentsError;

  // Filter cases based on active tab
  const filteredCases = useMemo(() => {
    if (!clientCases) return [];

    return activeTab === "all"
      ? clientCases
      : clientCases.filter((c) => c.case_status === activeTab.toUpperCase());
  }, [clientCases, activeTab]);

  if (isLoading) {
    return <ClientDashboardLoading />;
  }

  if (error) {
    return (
      <ClientDashboardError
        message={error.message || "An unknown error occurred."}
      />
    );
  }

  return (
    <>
      <HeaderActions
        backLink="/cases"
        // onCreate={() => setShowCreateModal(true)}
        // buttons={[
        //   {
        //     label: "Edit Case",
        //     to: `/cases//edit`,
        //   },
        // ]}
      />
      {clientCases.length === 0 ? (
        <h1> No cases found.</h1>
      ) : (
        <>
          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            <div className="col-span-3">
              {/* Cases Section */}
              <div className="mb-6">
                {clientCases.length > 0 && (
                  <ClientCaseTabs
                    clientCases={clientCases}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                )}

                {filteredCases.length > 0 ? (
                  <ClientCaseGrid
                    cases={filteredCases}
                    isLoadingEnriched={isLoadingEnrichedCases}
                  />
                ) : (
                  clientCases.length > 0 && (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No cases found with status "
                        {activeTab.replace(/_/g, " ")}".
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cases;
