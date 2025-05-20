// Suggested file: src/components/client-dashboard/ClientDashboardNoCases.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface ClientDashboardNoCasesProps {
  clientCompany: any; // Use the appropriate type for clientCompany
}

export const ClientDashboardNoCases: React.FC<ClientDashboardNoCasesProps> = ({
  clientCompany,
}) => {
  const navigate = useNavigate(); // Use the hook inside the component

  return (
    <div className="text-center py-12">
      <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-medium mb-2">No cases found</h2>
      {clientCompany ? (
        <p className="text-muted-foreground mb-6">
          You don't have any active cases with us yet. Would you like to start a
          new service?
        </p>
      ) : (
        <p className="text-muted-foreground mb-6">
          We couldn't find a company associated with your account. Please
          contact support.
        </p>
      )}
      {clientCompany && (
        <Button onClick={() => navigate("/services")}>Browse Services</Button>
      )}
    </div>
  );
};
