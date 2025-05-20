// src/pages/Client/ClientDashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyByUserIdQuery } from "@/hooks/useCompanies";
import { useCasesQuery } from "@/hooks/useCases";
import { useDocumentsQuery } from "@/hooks/useDocuments";
import { useQuery } from "@tanstack/react-query";
import { getServiceById } from "@/api/services";
import { getTaskInstancesCountByFilters } from "@/api/tasks";
import { getDocumentsCount, getPendingDocumentsCount } from "@/api/documents";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import type {
  ApiCase,
  Company,
  Service,
  CaseStatus,
  ClientCase,
} from "@/types/types";
import type { ApiDocument } from "@/types/documents";

// Import the smaller components
import { ClientDashboardHeader } from "@/components/client-dashboard/ClientDashboardHeader";
import { ClientDashboardError } from "@/components/client-dashboard/ClientDashboardError";
import { ClientDashboardLoading } from "@/components/client-dashboard/ClientDashboardLoading";
import { ClientDashboardNoCases } from "@/components/client-dashboard/ClientDashboardNoCases";
import { ClientCaseTabs } from "@/components/client-dashboard/ClientCaseTabs";
import { ClientCaseGrid } from "@/components/client-dashboard/ClientCaseGrid";
import CompanyCasesSection from "@/components/companies/CompanyCasesSection";
import CompanyDocumentsSection from "@/components/companies/CompanyDocumentsSection";

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

const ClientDashboard = () => {
  const { user, isLoading: isLoadingUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");

  // 1. Fetch the logged-in user's company
  const {
    data: clientCompany,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyByUserIdQuery(user?.id);

  // Redirect to onboarding if no company found for the user
  useEffect(() => {
    if (!isLoadingUser && !isLoadingCompany && clientCompany === null && user) {
      const timer = setTimeout(() => {
        navigate("/onboarding");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoadingUser, isLoadingCompany, clientCompany, user, navigate]);

  // 2. Fetch cases for the identified client company
  const {
    data: cases,
    isLoading: isLoadingCases,
    error: casesError,
  } = useCasesQuery({ companyId: clientCompany?.company_id });

  // 3. Fetch documents for the company
  const {
    data: documents = [],
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useDocumentsQuery({ companyId: clientCompany?.company_id });

  // 4. Enrich cases with service details and counts
  const enrichedCasesQuery = useQuery<ClientCase[], Error>({
    queryKey: ["clientCasesEnriched", cases, clientCompany?.company_id],
    queryFn: async () => {
      if (!cases || !clientCompany) return [];

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
    enabled: !!cases && !isLoadingCases,
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
    isLoadingCompany ||
    isLoadingCases ||
    isLoadingEnrichedCases ||
    isLoadingDocuments;

  const error =
    companyError || casesError || enrichedCasesError || documentsError;

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

  if (
    error &&
    !(clientCompany === null && !isLoadingCompany && !isLoadingUser)
  ) {
    return (
      <ClientDashboardError
        message={error.message || "An unknown error occurred."}
      />
    );
  }

  return (
    <>
      {/* Header Section */}
      <ClientDashboardHeader clientCompany={clientCompany} />

      {clientCompany && !isLoadingCases && cases?.length === 0 ? (
        <ClientDashboardNoCases clientCompany={clientCompany} />
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

            {/* Sidebar with Company Info and Documents */}
            <div className="col-span-3 space-y-6">
              {/* Company Documents Summary */}
              {clientCompany && (
                <CompanyDocumentsSection
                  companyId={clientCompany.company_id}
                  documents={documents as ApiDocument[]}
                  isLoading={isLoadingDocuments}
                  error={documentsError || null}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClientDashboard;
