// Suggested file: src/components/client-dashboard/ClientDashboardHeader.tsx
import React from "react";
import type { Company } from "@/types/types"; // Adjust path to your types file

interface ClientDashboardHeaderProps {
  clientCompany: Company | null;
}

export const ClientDashboardHeader: React.FC<ClientDashboardHeaderProps> = ({
  clientCompany,
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-1">Client Dashboard</h1>
      {clientCompany && (
        <p className="text-muted-foreground">
          Welcome, {clientCompany.name || "Client"} - Talha Khan. Contact:
          442-421-5593 | info@dijitze.com
        </p>
      )}
    </div>
  );
};
