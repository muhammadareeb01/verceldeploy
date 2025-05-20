
// src/components/services/ServicesErrorState.tsx
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServicesErrorStateProps {
  onRetry?: () => void;
}

const ServicesErrorState: React.FC<ServicesErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="text-center py-12 flex flex-col items-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-600 mb-6">
        We encountered a problem loading the services. Contact Talha Khan at
        442-421-5593 or info@dijitze.com.
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ServicesErrorState;
