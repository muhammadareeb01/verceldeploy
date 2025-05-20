
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import DocumentList from "@/components/documents/DocumentList";
import { DocumentEditModal } from "@/components/documents/DocumentEditModal";
import { useDocumentsQuery } from "@/hooks/useDocuments";

const Documents = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  
  const { data: documents, isLoading, error } = useDocumentsQuery();

  const handleDocumentClick = (id: string) => {
    setSelectedDocumentId(id);
    setIsAddModalOpen(true);
  };

  const handleAddDocument = () => {
    setSelectedDocumentId(null); // Clear any selected document
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedDocumentId(null);
  };

  if (error) {
    toast.error("Failed to load documents", {
      description: error.message
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Documents</h1>
          <p className="text-muted-foreground">
            Manage and track all client and case documents
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddDocument}>
          <Plus size={18} />
          <span>Upload Document</span>
        </Button>
      </div>

      <DocumentList
        documents={documents || []}
        isLoading={isLoading}
        onDocumentClick={handleDocumentClick}
      />

      {/* Document Edit Modal - Used for both add and edit */}
      {isAddModalOpen && (
        <DocumentEditModal
          documentId={selectedDocumentId || ''}
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          isCreateMode={!selectedDocumentId}
        />
      )}
    </>
  );
};

export default Documents;
