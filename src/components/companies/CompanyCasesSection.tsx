// src/components/companies/CompanyCasesSection.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { Link } from "react-router-dom";

interface Case {
  case_id: string;
  service_name?: string;
  case_status?: string;
  start_date?: string;
  target_date?: string;
  progress_percent?: number;
}

interface CompanyCasesSectionProps {
  companyId: string;
  cases: Case[];
  isLoading: boolean;
  error: Error | null;
}

const CompanyCasesSection: React.FC<CompanyCasesSectionProps> = ({
  companyId,
  cases,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" /> Company Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" /> Company Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load cases: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" /> Company Cases
          </div>
          <Badge variant="outline">{cases.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length > 0 ? (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.case_id}
                className="flex bg-primary/5 rounded-lg p-4 flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {caseItem.service_name || "Unnamed Case"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{caseItem.case_status}</Badge>
                    <span>•</span>
                    <span>Started: {formatDate(caseItem.start_date)}</span>
                    {caseItem.target_date && (
                      <>
                        <span>•</span>
                        <span>Target: {formatDate(caseItem.target_date)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2 sm:mt-0"
                >
                  <Link to={`/cases/${caseItem.case_id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No cases found for this company.</p>
          </div>
        )}

        <div className="mt-4 text-right">
          <Link to={`/cases?companyId=${companyId}`}>
            <Button variant="default">View All Cases</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCasesSection;
