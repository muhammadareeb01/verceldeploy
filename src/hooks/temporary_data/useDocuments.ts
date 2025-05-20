import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentTypes,
  getDocumentsCount,
  getPendingDocumentsCount,
} from "@/api/documents";
import { toast } from "sonner";
import {
  ApiDocument,
  DocumentCreateData,
  DocumentUpdateData,
  GetDocumentsFilters,
  DocumentType,
} from "@/types/documents";

// --- Query Keys ---
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  detail: (documentId: string) =>
    [...documentKeys.all, "detail", documentId] as const,
  documentTypes: () => [...documentKeys.all, "types"] as const,
  filters: (filters: GetDocumentsFilters) =>
    [...documentKeys.all, "filters", filters] as const,
  count: (caseId: string) => [...documentKeys.all, "count", caseId] as const,
  pendingCount: (caseId: string) =>
    [...documentKeys.all, "pending-count", caseId] as const,
};

// --- Document Hooks (Queries) ---

/**
 * Fetches all documents.
 * @param filters - Optional filters to apply to the query
 * @returns useQueryResult for ApiDocument[]
 */
export const useDocumentsQuery = (filters?: GetDocumentsFilters) => {
  return useQuery<ApiDocument[], Error>({
    queryKey: filters ? documentKeys.filters(filters) : documentKeys.lists(),
    queryFn: () => getDocuments(filters),
  });
};

/**
 * Alias for useDocumentsQuery that makes it more semantically clear
 * when filtering documents by specific criteria
 */
export const useDocumentsByFilterQuery = useDocumentsQuery;

/**
 * Fetches a single document by ID.
 * @param documentId - The ID of the document to fetch.
 * @returns useQueryResult for ApiDocument | null
 */
export const useDocumentByIdQuery = (documentId?: string) => {
  return useQuery<ApiDocument | null, Error>({
    queryKey: documentKeys.detail(documentId || ""),
    queryFn: () => getDocumentById(documentId || ""),
    enabled: !!documentId, // Only run the query if documentId is provided
  });
};

/**
 * Fetches document types.
 * @returns useQueryResult for DocumentType[]
 */
export const useDocumentTypesQuery = () => {
  console.log("Fetching document types...");
  return useQuery<DocumentType[], Error>({
    queryKey: documentKeys.documentTypes(),
    queryFn: async () => {
      const types = await getDocumentTypes();
      console.log("Document types fetched:", types);
      return types;
    },
  });
};

/**
 * Fetches the count of documents for a specific case.
 * @param caseId - The ID of the case
 * @returns useQueryResult for number
 */
export const useDocumentsCountQuery = (caseId?: string) => {
  return useQuery<number, Error>({
    queryKey: documentKeys.count(caseId || ""),
    queryFn: () => getDocumentsCount(caseId || ""),
    enabled: !!caseId,
  });
};

/**
 * Fetches the count of pending documents for a specific case.
 * @param caseId - The ID of the case
 * @returns useQueryResult for number
 */
export const usePendingDocumentsCountQuery = (caseId?: string) => {
  return useQuery<number, Error>({
    queryKey: documentKeys.pendingCount(caseId || ""),
    queryFn: () => getPendingDocumentsCount(caseId || ""),
    enabled: !!caseId,
  });
};

// --- Document Hooks (Mutations) ---

/**
 * Mutation to create a new document.
 * @returns useMutationResult for creating a document
 */
export const useCreateDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiDocument, Error, DocumentCreateData>({
    mutationFn: createDocument,
    onSuccess: (newDocument) => {
      // Invalidate lists of documents
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Also invalidate filtered lists
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
        predicate: (query) =>
          query.queryKey[0] === "documents" &&
          (query.queryKey[1] === "list" || query.queryKey[1] === "filters"),
      });

      toast.success("Document Created", {
        description: "New document has been successfully created.",
      });
    },
    onError: (error) => {
      toast.error("Failed to create document", {
        description: error.message,
      });
    },
  });
};

/**
 * Mutation to update an existing document.
 * @returns useMutationResult for updating a document
 */
export const useUpdateDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiDocument,
    Error,
    { documentId: string; data: DocumentUpdateData }
  >({
    mutationFn: ({ documentId, data }) => updateDocument(documentId, data),
    onSuccess: (updatedDocument) => {
      // Invalidate the specific document detail
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(updatedDocument.document_id),
      });
      // Invalidate lists of documents
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Also invalidate filtered lists
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
        predicate: (query) =>
          query.queryKey[0] === "documents" &&
          (query.queryKey[1] === "list" || query.queryKey[1] === "filters"),
      });

      toast.success("Document Updated", {
        description: "Document has been successfully updated.",
      });
    },
    onError: (error) => {
      toast.error("Failed to update document", {
        description: error.message,
      });
    },
  });
};

/**
 * Mutation to delete a document.
 * @returns useMutationResult for deleting a document
 */
export const useDeleteDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteDocument,
    onSuccess: (data, documentId) => {
      // Invalidate lists of documents
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Remove the specific document from the cache
      queryClient.removeQueries({
        queryKey: documentKeys.detail(documentId),
      });
      // Also invalidate filtered lists
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
        predicate: (query) =>
          query.queryKey[0] === "documents" &&
          (query.queryKey[1] === "list" || query.queryKey[1] === "filters"),
      });

      toast.success("Document Deleted", {
        description: "Document has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast.error("Failed to delete document", {
        description: error.message,
      });
    },
  });
};
