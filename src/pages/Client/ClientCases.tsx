
// src/pages/Client/ClientCases.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCasesQuery } from "@/hooks/useCases";
import { useCompanyByUserIdQuery } from "@/hooks/useCompanies";
import { ClientDashboardHeader } from "@/components/client-dashboard/ClientDashboardHeader";
import { ClientDashboardLoading } from "@/components/client-dashboard/ClientDashboardLoading";
import { ClientDashboardError } from "@/components/client-dashboard/ClientDashboardError";
import { ClientCaseGrid } from "@/components/client-dashboard/ClientCaseGrid";
import { ClientDashboardNoCases } from "@/components/client-dashboard/ClientDashboardNoCases";
import { Button } from "@/components/ui/button";

const ClientCases: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch client's company
  const {
    data: clientCompany,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyByUserIdQuery(user?.id);

  // If company is available, fetch cases for this company
  const {
    data: cases = [],
    isLoading: isLoadingCases,
    error: casesError,
  } = useCasesQuery({
    companyId: clientCompany?.company_id,
  });

  const isLoading = isLoadingCompany || isLoadingCases;
  const error = companyError || casesError;

  if (isLoading) {
    return <ClientDashboardLoading />;
  }

  if (error) {
    return (
      <ClientDashboardError
        message={`Failed to load your cases: ${error.message}`}
      />
    );
  }

  if (cases.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <ClientDashboardHeader clientCompany={clientCompany} />
        <ClientDashboardNoCases />
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link to="/client-services">Browse our services</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ClientDashboardHeader clientCompany={clientCompany} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Cases</h1>
        <Button asChild>
          <Link to="/client-services">Request New Service</Link>
        </Button>
      </div>
      
      <ClientCaseGrid cases={cases} />
    </div>
  );
};

export default ClientCases;
