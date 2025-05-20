// Suggested file: src/components/client-dashboard/ClientDashboardError.tsx
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ClientDashboardErrorProps {
  message: string;
}

export const ClientDashboardError: React.FC<ClientDashboardErrorProps> = ({
  message,
}) => {
  return (
    <div className="container mx-auto p-6">
      {" "}
      {/* Added container/padding for better centering */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};
