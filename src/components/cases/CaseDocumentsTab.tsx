
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DocumentCard from "@/components/documents/DocumentCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDocumentTypesQuery } from "@/hooks/useDocuments";
import { ApiDocument } from "@/types/documents";
import { useServiceByIdQuery } from "@/hooks/useServices";

interface CaseDocumentsTabProps {
  documents: ApiDocument[];
  caseId: string;
  serviceId: string;
}

const CaseDocumentsTab: React.FC<CaseDocumentsTabProps> = ({ 
  documents, 
  caseId,
  serviceId 
}) => {
  const [showOnlySubmitted, setShowOnlySubmitted] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState<ApiDocument[]>(documents);
  
  // Fetch document types for this service
  const { data: documentTypes = [] } = useDocumentTypesQuery({
    serviceId: serviceId
  });
  
  // Get service details
  const { data: service } = useServiceByIdQuery(serviceId);
  
  useEffect(() => {
    // Apply filter for submitted/all documents
    if (showOnlySubmitted) {
      setFilteredDocuments(documents.filter(doc => 
        doc.status !== 'NOT_SUBMITTED' && doc.status !== null
      ));
    } else {
      setFilteredDocuments(documents);
    }
  }, [documents, showOnlySubmitted]);
  
  // Get required document types that don't have a submitted document
  const missingRequiredDocuments = documentTypes.filter(docType => 
    !documents.some(doc => doc.doc_type_id === docType.doc_type_id)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Documents ({documents.length})
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-submitted" 
              checked={showOnlySubmitted}
              onCheckedChange={setShowOnlySubmitted}
            />
            <Label htmlFor="show-submitted">Show only submitted</Label>
          </div>
          <Button variant="outline">Upload Document</Button>
        </div>
      </div>
      
      {missingRequiredDocuments.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Required Documents</h4>
            <ul className="list-disc pl-5 space-y-1">
              {missingRequiredDocuments.map((docType) => (
                <li key={docType.doc_type_id} className="text-sm">
                  {docType.doc_type_name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">
              {showOnlySubmitted 
                ? "No submitted documents found for this case."
                : "No documents found for this case."}
            </p>
            <Button className="mt-4" variant="outline">
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.document_id}
              document={document}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseDocumentsTab;
