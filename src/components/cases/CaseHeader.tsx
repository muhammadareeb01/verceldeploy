import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiCase } from "@/types/types";

interface CaseHeaderProps {
  caseData: ApiCase;
  calculateTaskProgress: () => number;
}

const CaseHeader: React.FC<CaseHeaderProps> = ({
  caseData,
  calculateTaskProgress,
}) => {
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-slate-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      case "ON_HOLD":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Case for {caseData.service?.service_name || "Unknown Service"}
        </h1>
        <div className="flex flex-wrap gap-3 mb-4">
          <Badge className={`${getStatusColor(caseData.case_status)}`}>
            {caseData.case_status.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline">Priority: {caseData.priority}</Badge>
          <Badge variant="outline">
            Progress: {caseData.progress_percent || calculateTaskProgress()}%
          </Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">Edit Case</Button>
        <Button>Update Status</Button>
      </div>
    </div>
  );
};

export default CaseHeader;
