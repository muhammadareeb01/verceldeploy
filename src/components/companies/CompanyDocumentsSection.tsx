// src/components/companies/CompanyDocumentsSection.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, Loader2, Download, Eye } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { Link } from "react-router-dom";

interface DocumentType {
  doc_type_id: string;
  doc_type_name: string;
}

interface Document {
  document_id: string;
  doc_name: string;
  doc_type?: DocumentType;
  submission_date?: string;
  status?: string;
  storage_path?: string;
}

interface CompanyDocumentsSectionProps {
  companyId: string;
  documents: Document[];
  isLoading: boolean;
  error: Error | null;
}

const CompanyDocumentsSection: React.FC<CompanyDocumentsSectionProps> = ({
  companyId,
  documents,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Card className="bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Company Documents
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
      <Card className="bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Company Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load documents: {error.message}</p>
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
            <FileText className="mr-2 h-5 w-5" /> Company Documents
          </div>
          <Badge variant="outline">{documents.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-2 rounded-lg">
            {documents.map((document) => (
              <div
                key={document.document_id}
                className="flex flex-col bg-primary/5 rounded-lg p-4 text-left  sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-0"
              >
                <div className="space-y-4">
                  <div className="font-medium">{document.doc_name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{document.status}</Badge>
                    {document.doc_type && (
                      <>
                        <span>•</span>
                        <span>{document.doc_type.doc_type_name}</span>
                      </>
                    )}
                    {document.submission_date && (
                      <>
                        <span>•</span>
                        <span>
                          Submitted: {formatDate(document.submission_date)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  {document.storage_path && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {documents.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Showing 5 of {documents.length} documents
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No documents found for this company.</p>
          </div>
        )}

        <div className="mt-4 text-right">
          <Link to={`/documents?companyId=${companyId}`}>
            <Button variant="default">View All Documents</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyDocumentsSection;
