import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ApiDocument,
  DocumentUpdateData,
  DocumentCreateData,
  DocStatus,
  DocumentType,
} from "@/types/documents";
import { Company } from "@/types/types";
import { ApiCase } from "@/types/types";
import { toast } from "sonner";
import {
  useDocumentByIdQuery,
  useUpdateDocumentMutation,
  useCreateDocumentMutation,
  useDocumentTypesQuery,
} from "@/hooks/useDocuments";
import { useCompaniesQuery } from "@/hooks/useCompanies";
import { useCasesByCompanyIdQuery } from "@/hooks/useCases";

interface DocumentEditModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  isCreateMode?: boolean;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  documentId,
  isOpen,
  onClose,
  isCreateMode = false,
}) => {
  // Fetch document data (not needed for create mode)
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: fetchError,
  } = useDocumentByIdQuery(isCreateMode ? "" : documentId);

  // Fetch document types with debugging
  const {
    data: documentTypes = [],
    isLoading: isLoadingTypes,
    error: typesError,
  } = useDocumentTypesQuery();

  // Add console logs for debugging document types
  useEffect(() => {
    if (isOpen) {
      console.log("Document Types Loading:", isLoadingTypes);
      console.log("Document Types Error:", typesError);
      console.log("Document Types Data:", documentTypes);
    }
  }, [isOpen, isLoadingTypes, documentTypes, typesError]);

  // Fetch companies
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useCompaniesQuery();

  // Update mutation
  const updateMutation = useUpdateDocumentMutation();

  // Create mutation
  const createMutation = useCreateDocumentMutation();

  // Form state
  const [docName, setDocName] = useState("");
  const [docTypeId, setDocTypeId] = useState<string>("");
  const [status, setStatus] = useState<DocStatus>(DocStatus.NOT_SUBMITTED);
  const [notes, setNotes] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [caseId, setCaseId] = useState<string>("");

  // Fetch company-specific cases when companyId changes
  const { data: companyCases, isLoading: isLoadingCases } =
    useCasesByCompanyIdQuery(companyId);

  // Initialize form state when document loads or in create mode
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        // Initialize create mode with default values
        setDocName("");
        setDocTypeId("");
        setStatus(DocStatus.NOT_SUBMITTED);
        setNotes("");
        setStoragePath("");
        setCompanyId("");
        setCaseId("");
      } else if (document) {
        // Initialize edit mode with document data
        setDocName(document.doc_name || "");
        setDocTypeId(document.doc_type_id || "");
        setStatus(document.status || DocStatus.NOT_SUBMITTED);
        setNotes(document.notes || "");
        setStoragePath(document.storage_path || "");
        setCompanyId(document.company_id || "");
        setCaseId(document.case_id || "");
      }
    }
  }, [isOpen, document, isCreateMode]);

  // Reset case selection when company changes
  useEffect(() => {
    if (companyId && caseId) {
      // Only reset if the current caseId doesn't belong to the new company
      if (companyCases && !companyCases.some((c) => c.case_id === caseId)) {
        setCaseId("");
      }
    }
  }, [companyId, companyCases, caseId]);

  const handleSave = async () => {
    // Validation
    if (!docName.trim()) {
      toast.error("Validation Error", {
        description: "Document name is required.",
      });
      return;
    }
    if (!docTypeId) {
      toast.error("Validation Error", {
        description: "Document type is required.",
      });
      return;
    }
    if (!storagePath.trim()) {
      toast.error("Validation Error", {
        description: "Storage path is required.",
      });
      return;
    }
    if (isCreateMode && !companyId) {
      toast.error("Validation Error", {
        description: "Company is required.",
      });
      return;
    }

    if (isCreateMode) {
      // Create new document
      const newDocData: DocumentCreateData = {
        doc_name: docName,
        doc_type_id: docTypeId,
        company_id: companyId,
        case_id: caseId ? (caseId === "no-case" ? null : caseId) : null,
        status,
        notes: notes || null,
        storage_path: storagePath,
      };

      createMutation.mutate(newDocData, {
        onSuccess: () => {
          toast.success("Document Created", {
            description: "New document has been successfully created.",
          });
          onClose();
        },
        onError: (err) => {
          toast.error("Creation Failed", {
            description: `Failed to create document: ${err.message}.`,
          });
        },
      });
    } else {
      // Update existing document
      const updatedData: DocumentUpdateData = {
        doc_name: docName,
        doc_type_id: docTypeId,
        status,
        notes: notes || null,
        storage_path: storagePath,
        case_id: caseId ? (caseId === "no-case" ? null : caseId) : null,
      };

      updateMutation.mutate(
        {
          documentId,
          data: updatedData,
        },
        {
          onSuccess: () => {
            toast.success("Document Updated", {
              description: "Document details have been successfully updated.",
            });
            onClose();
          },
          onError: (err) => {
            toast.error("Update Failed", {
              description: `Failed to update document: ${err.message}.`,
            });
          },
        }
      );
    }
  };

  // Loading state for document or types
  if (
    !isCreateMode &&
    (isLoadingDocument || isLoadingTypes || isLoadingCompanies)
  ) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading document details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Only check for document error in edit mode
  if (!isCreateMode && (fetchError || !document) && !isCreateMode) {
    const errorMessage = fetchError?.message || "Document not found.";
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Document</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Error loading document types (affects both create and edit)
  if (typesError || !documentTypes) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Document Types</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {typesError?.message || "Failed to load document types."}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Check for companies error
  if (companiesError || !companies) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Companies</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {companiesError?.message || "Failed to load companies."}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Determine if mutation is in progress
  const isMutating = updateMutation.isPending || createMutation.isPending;

  // Render form
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode
              ? "Add New Document"
              : `Edit Document: ${document?.doc_name}`}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? "Create a new document in the system."
              : `Edit details for document ID: ${
                  document?.document_id || "N/A"
                }.`}
          </DialogDescription>
        </DialogHeader>
        {updateMutation.isError && updateMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{updateMutation.error.message}</AlertDescription>
          </Alert>
        )}
        {createMutation.isError && createMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{createMutation.error.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 py-4">
          {/* Document Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-name" className="text-right">
              Document Name
            </Label>
            <Input
              id="doc-name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="col-span-3"
              required
              disabled={isMutating}
            />
          </div>

          {/* Company Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Select
              value={companyId}
              onValueChange={setCompanyId}
              disabled={isMutating || (!isCreateMode && !!document?.company_id)}
            >
              <SelectTrigger id="company" className="col-span-3">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company: Company) => (
                  <SelectItem
                    key={company.company_id}
                    value={company.company_id}
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Case Selection (only shown when company is selected) */}
          {companyId && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="case" className="text-right">
                Related Case
              </Label>
              <Select
                value={caseId}
                onValueChange={setCaseId}
                disabled={isMutating || isLoadingCases}
              >
                <SelectTrigger id="case" className="col-span-3">
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-case">
                    No case (document only)
                  </SelectItem>
                  {companyCases?.map((case_: ApiCase) => (
                    <SelectItem key={case_.case_id} value={case_.case_id}>
                      {case_.service?.service_name || "Case"} -{" "}
                      {new Date(case_.created_at || "").toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Document Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-type" className="text-right">
              Document Type
            </Label>
            <Select
              value={docTypeId}
              onValueChange={setDocTypeId}
              disabled={isMutating}
            >
              <SelectTrigger id="doc-type" className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(documentTypes) && documentTypes.length > 0 ? (
                  documentTypes.map((type: DocumentType) => (
                    <SelectItem key={type.doc_type_id} value={type.doc_type_id}>
                      {type.doc_type_name.replace(/_/g, " ")}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-types-available" disabled>
                    No document types available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {/* Add debug info about document types */}
            {isLoadingTypes && (
              <p className="text-xs text-muted-foreground col-span-3 mt-1">
                Loading document types...
              </p>
            )}
            {!isLoadingTypes && documentTypes?.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3 mt-1">
                No document types available.
              </p>
            )}
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-status" className="text-right">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value: DocStatus) => setStatus(value)}
              disabled={isMutating}
            >
              <SelectTrigger id="doc-status" className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DocStatus).map((statusValue) => (
                  <SelectItem
                    key={statusValue as string}
                    value={statusValue as string}
                  >
                    {(statusValue as string).replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Storage Path */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-storage-path" className="text-right">
              Storage Path
            </Label>
            <Input
              id="doc-storage-path"
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              className="col-span-3"
              required
              disabled={isMutating}
            />
          </div>

          {/* Notes */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="doc-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              disabled={isMutating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMutating}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={
              isMutating ||
              !docName.trim() ||
              !docTypeId ||
              !storagePath.trim() ||
              !companyId
            }
          >
            {isMutating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreateMode ? "Creating..." : "Saving..."}
              </>
            ) : isCreateMode ? (
              "Create document"
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
