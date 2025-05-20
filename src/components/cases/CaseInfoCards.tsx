import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ApiCase } from "@/types/types";
import { Building2, Calendar, User } from "lucide-react";
import { formatDate } from "@/utils/formatters";

interface CaseInfoCardsProps {
  caseData: ApiCase;
}

const CaseInfoCards: React.FC<CaseInfoCardsProps> = ({ caseData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Client Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Building2 className="h-9 w-9 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">
                Client
              </h3>
              <p className="font-semibold text-lg">
                {caseData.company?.name || "Not Assigned"}
              </p>
              <p className="text-sm text-muted-foreground">
                {caseData.company?.primary_contact_name || ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned To Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start">
            <User className="h-9 w-9 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">
                Assigned To
              </h3>
              <p className="font-semibold text-lg">
                {caseData.assignedUser?.full_name || "Not Assigned"}
              </p>
              <p className="text-sm text-muted-foreground">
                {caseData.assignedUser?.role || ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Calendar className="h-9 w-9 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">
                Timeline
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Start:</span>
                  <span className="font-medium text-sm">
                    {formatDate(caseData.start_date) || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Target:</span>
                  <span className="font-medium text-sm">
                    {formatDate(caseData.target_date) || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion:</span>
                  <span className="font-medium text-sm">
                    {formatDate(caseData.actual_completion_date) || "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseInfoCards;
