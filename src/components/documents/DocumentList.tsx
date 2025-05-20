
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import DocumentCard from "@/components/documents/DocumentCard";
import { Loader2 } from "lucide-react";
import { ApiDocument } from "@/types/documents";

interface DocumentListProps {
  documents: ApiDocument[];
  isLoading: boolean;
  onDocumentClick: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  onDocumentClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!documents.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No documents found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <DocumentCard
          key={document.document_id}
          document={document}
          onClick={() => onDocumentClick(document.document_id)}
        />
      ))}
    </div>
  );
};

export default DocumentList;
