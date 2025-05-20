// Suggested file: src/components/cases/CaseDocumentsSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react"; // Added Loader2
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// Import hooks and types
import {
  useDocumentsQuery,
  useDeleteDocumentMutation,
} from "@/hooks/useDocuments"; // Fixed import
import { ApiDocument, DocStatus } from "@/types/documents"; // Adjust path
import { DocumentEditModal } from "@/components/documents/DocumentEditModal"; // Assuming this component exists
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"; // Assuming this exists

interface CaseDocumentsSectionProps {
  caseId: string; // The ID of the case to fetch documents for
}

const CaseDocumentsSection: React.FC<CaseDocumentsSectionProps> = ({
  caseId,
}) => {
  // Fetch documents for the specific case using the hook
  const {
    data: documents = [],
    isLoading,
    error,
  } = useDocumentsQuery({ caseId }); // Fixed function call

  // Mutation hook for deleting documents
  const deleteMutation = useDeleteDocumentMutation();
  const isDeleting = deleteMutation.isPending;

  // State for managing the edit modal
  const [selectedDocument, setSelectedDocument] = useState<ApiDocument | null>(
    null
  );
  const [isDocumentEditModalOpen, setIsDocumentEditModalOpen] = useState(false);

  // State for managing the delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ApiDocument | null>(
    null
  );

  // Handle error from the query
  if (error) {
    // The hook's onError already shows a toast, but you might want to render an error message here too
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            Error loading documents: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state from the query
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle opening the edit modal
  const handleDocumentEdit = (document: ApiDocument) => {
    setSelectedDocument(document);
    setIsDocumentEditModalOpen(true);
  };

  // Handle closing the edit modal
  const handleEditModalClose = () => {
    setIsDocumentEditModalOpen(false);
    setSelectedDocument(null); // Clear selected document when closing
  };

  // Handle clicking the delete button
  const handleDeleteClick = (document: ApiDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Handle confirming the delete action
  const handleDeleteConfirm = () => {
    if (!documentToDelete) return;

    deleteMutation.mutate(documentToDelete.document_id, {
      // Use the mutation hook
      onSuccess: () => {
        // Toast is handled by the hook's onSuccess
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
      },
      onError: (error) => {
        // Toast is handled by the hook's onError
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
      },
    });
  };

  // Helper to get badge variant based on document status
  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="default">Approved</Badge>;
      case "SUBMITTED":
        return <Badge variant="outline">Submitted</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="outline">Pending Review</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "NOT_SUBMITTED": // Assuming NOT_SUBMITTED is a pending status
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Documents ({documents.length})</CardTitle>{" "}
          {/* Display count */}
          {/* Link to add a new document for this case */}
          <Button asChild size="sm">
            <Link to={`/cases/${caseId}/documents/new`}>Add Document</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead> {/* Added Document Type */}
                <TableHead>Status</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Submission Date</TableHead>{" "}
                {/* Added Submission Date */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.document_id}>
                  {" "}
                  {/* Use document_id as key */}
                  <TableCell className="font-medium">
                    {document.doc_name}
                  </TableCell>
                  <TableCell>
                    {document.doc_type?.doc_type_name || "-"}
                  </TableCell>{" "}
                  {/* Display document type */}
                  <TableCell>{getStatusBadge(document.status)}</TableCell>{" "}
                  {/* Use the helper function */}
                  <TableCell>
                    {document.submittedByUser?.full_name || "N/A"}{" "}
                    {/* Display submitted by user name */}
                  </TableCell>
                  <TableCell>
                    {document.submission_date
                      ? format(
                          new Date(document.submission_date),
                          "MMM dd, yyyy"
                        )
                      : "N/A"}{" "}
                    {/* Display submission date */}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDocumentEdit(document)} // Pass the document object
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(document)} // Pass the document object
                          className="text-destructive"
                          disabled={isDeleting} // Disable delete while deleting
                        >
                          {isDeleting &&
                          documentToDelete?.document_id ===
                            document.document_id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No documents for this case.</p>
        )}
      </CardContent>

      {/* Document Edit Modal */}
      {selectedDocument && (
        <DocumentEditModal
          documentId={selectedDocument.document_id} // Pass the document_id
          isOpen={isDocumentEditModalOpen}
          onClose={handleEditModalClose} // Use the dedicated close handler
        />
      )}

      {/* Delete Confirmation Dialog */}
      {documentToDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Document"
          description={`Are you sure you want to delete "${documentToDelete.doc_name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      )}
    </Card>
  );
};

export default CaseDocumentsSection;
