import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { RecentCaseInfo } from "@/types/dashboard";

interface RecentCasesProps {
  cases: RecentCaseInfo[];
}

const statusVariants: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const RecentCases: React.FC<RecentCasesProps> = ({ cases }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Recent Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.case_id}>
                <TableCell className="font-medium">
                  {caseItem.companyName}
                </TableCell>
                <TableCell>{caseItem.serviceName}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "font-normal",
                      statusVariants[caseItem.case_status] || "bg-gray-100"
                    )}
                  >
                    {caseItem.case_status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(caseItem.created_at, {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentCases;
