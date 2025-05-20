
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiDocument, DocStatus } from "@/types/documents";

interface DocumentCardProps {
  document: ApiDocument;
  onClick: () => void;
}

// Function to get badge variant based on document status
const getStatusBadgeVariant = (status: DocStatus) => {
  switch (status) {
    case DocStatus.APPROVED:
      return "success";
    case DocStatus.REJECTED:
    case DocStatus.CLIENT_ACTION_REQUIRED:
      return "destructive";
    case DocStatus.UNDER_REVIEW:
      return "warning";
    case DocStatus.SUBMITTED:
      return "secondary";
    case DocStatus.NOT_SUBMITTED:
    default:
      return "outline";
  }
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-2">{document.doc_name}</h3>
          <Badge variant={getStatusBadgeVariant(document.status) as any}>
            {document.status?.replace(/_/g, " ") || "No Status"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium">Type:</span>{" "}
            {document.doc_type?.doc_type_name.replace(/_/g, " ") || "Unknown"}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">Company:</span>{" "}
            {document.company_id || "N/A"}
          </p>
          {document.case_id && (
            <p className="text-muted-foreground">
              <span className="font-medium">Case ID:</span> {document.case_id}
            </p>
          )}
          {document.submittedByUser && (
            <p className="text-muted-foreground">
              <span className="font-medium">Submitted by:</span>{" "}
              {document.submittedByUser.full_name || "Unknown"}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-0">
        {document.submission_date
          ? `Submitted on ${formatDate(document.submission_date)}`
          : document.created_at
          ? `Created on ${formatDate(document.created_at)}`
          : ""}
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
