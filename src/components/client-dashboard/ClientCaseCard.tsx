// Suggested file: src/components/client-dashboard/ClientCaseCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/formatters"; // Keep formatter
import type { ClientCase, CaseStatus } from "@/types/types"; // Adjust path to your types file
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Define status colors and icons (kept as they are UI concerns)
const statusColors: Record<CaseStatus, string> = {
  // Use CaseStatus enum for keys
  NOT_STARTED: "bg-gray-200 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusIcons: Record<CaseStatus, JSX.Element> = {
  // Use CaseStatus enum for keys
  NOT_STARTED: <Clock className="h-4 w-4 mr-1" />,
  IN_PROGRESS: <Clock className="h-4 w-4 mr-1" />,
  COMPLETED: <CheckCircle className="h-4 w-4 mr-1" />,
  ON_HOLD: <AlertCircle className="h-4 w-4 mr-1" />,
  CANCELLED: <AlertCircle className="h-4 w-4 mr-1" />,
};

interface ClientCaseCardProps {
  caseItem: ClientCase;
  isLoadingEnriched: boolean; // Pass loading state for enriched data
}

export const ClientCaseCard: React.FC<ClientCaseCardProps> = ({
  caseItem,
  isLoadingEnriched,
}) => {
  const navigate = useNavigate(); // Use the hook inside the component

  return (
    <Card
      key={caseItem.case_id}
      className="overflow-hidden hover:bg-primary/5 cursor-pointer"
      onClick={() => navigate(`/cases/${caseItem.case_id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {/* Use optional chaining and check for loading state */}
            {caseItem.service?.service_name ||
              (isLoadingEnriched ? "Loading Service..." : "Unknown Service")}
          </CardTitle>
          {caseItem.case_status && ( // Only render if status exists
            <Badge
              className={
                statusColors[caseItem.case_status] ||
                "bg-gray-200 text-gray-800" // Fallback color
              }
            >
              <div className="flex items-center">
                {statusIcons[caseItem.case_status] || (
                  <Clock className="h-4 w-4 mr-1" />
                )}{" "}
                {/* Fallback icon */}
                {caseItem.case_status.replace(/_/g, " ")}{" "}
                {/* Display status with spaces */}
              </div>
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {/* Use optional chaining and check for loading state */}
          {caseItem.service?.description ||
            (isLoadingEnriched
              ? "Loading Description..."
              : "No description available")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {caseItem.progress_percent ?? 0}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${caseItem.progress_percent ?? 0}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {formatDate(caseItem.start_date) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Target Date</p>
              <p className="font-medium">
                {caseItem.target_date
                  ? formatDate(caseItem.target_date)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-blue-500" />
            {/* Display tasks count, show spinner or placeholder while enriching */}
            <span>
              {isLoadingEnriched ? "..." : `${caseItem.tasks_count ?? 0} Tasks`}
            </span>
          </div>
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1 text-blue-500" />
            {/* Display pending documents count, show spinner or placeholder while enriching */}
            <span>
              {isLoadingEnriched
                ? "..."
                : `${caseItem.pending_documents ?? 0} Docs Needed`}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
