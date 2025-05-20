// Suggested file: src/api/documents.ts
import { supabase } from "@/integrations/supabase/client";
import {
  ApiDocument,
  Document,
  DocumentCreateData,
  DocumentUpdateData,
  DocumentType,
  DocStatus,
  GetDocumentsFilters,
} from "@/types/documents";
import { UserRole, UserDetail } from "@/types/types";

// --- Helper Functions ---
const mapToUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role || typeof role !== "string") {
    return null;
  }
  const validUserRoles: UserRole[] = Object.values(UserRole);
  return validUserRoles.includes(role as UserRole) ? (role as UserRole) : null;
};

const transformApiDocument = (d: any): ApiDocument | null => {
  if (!d) return null;

  const baseDocument: Document = {
    document_id: d.document_id,
    case_id: d.case_id,
    company_id: d.company_id,
    doc_name: d.doc_name,
    doc_type_id: d.doc_type_id,
    status: d.status,
    provided_by: d.provided_by,
    submitted_by: d.submitted_by,
    submission_date: d.submission_date,
    review_by: d.review_by,
    review_date: d.review_date,
    storage_path: d.storage_path,
    version: d.version,
    notes: d.notes,
    created_at: d.created_at,
    updated_at: d.updated_at,
  };

  const apiDocument: ApiDocument = {
    ...baseDocument,
    doc_type: d.doc_type
      ? {
          doc_type_id: d.doc_type.doc_type_id,
          service_id: d.doc_type.service_id,
          doc_type_name: d.doc_type.doc_type_name,
          description: d.doc_type.description,
          created_at: d.doc_type.created_at,
          updated_at: d.doc_type.updated_at,
        }
      : null,
    submittedByUser: d.submittedByUser
      ? {
          id: d.submittedByUser.id,
          full_name: d.submittedByUser.full_name,
          role: mapToUserRole(d.submittedByUser.role),
          email: d.submittedByUser.email,
        }
      : null,
    reviewByUser: d.reviewByUser
      ? {
          id: d.reviewByUser.id,
          full_name: d.reviewByUser.full_name,
          role: mapToUserRole(d.submittedByUser.role),
          email: d.reviewByUser.email,
        }
      : null,
  };

  return apiDocument;
};

// --- Document API Functions ---
export const getDocuments = async (
  filters: GetDocumentsFilters = {}
): Promise<ApiDocument[]> => {
  try {
    let query = supabase.from("documents").select(
      `
        *,
        doc_type:document_types ( doc_type_id, service_id, doc_type_name, description, created_at, updated_at ),
        submittedByUser:profiles!documents_submitted_by_fkey ( id, full_name, role, email ),
        reviewByUser:profiles!documents_review_by_fkey ( id, full_name, role, email )
      `
    );

    if (filters.caseId) {
      query = query.eq("case_id", filters.caseId);
    }
    if (filters.companyId) {
      query = query.eq("company_id", filters.companyId);
    }
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in("status", filters.status);
      } else {
        query = query.eq("status", filters.status);
      }
    }
    if (filters.docTypeId) {
      if (Array.isArray(filters.docTypeId)) {
        query = query.in("doc_type_id", filters.docTypeId);
      } else {
        query = query.eq("doc_type_id", filters.docTypeId);
      }
    }
    if (filters.serviceId) {
      if (Array.isArray(filters.serviceId)) {
        query = query.in("doc_type.service_id", filters.serviceId);
      } else {
        query = query.eq("doc_type.service_id", filters.serviceId);
      }
    }
    if (filters.providedByUserId) {
      query = query.eq("provided_by", filters.providedByUserId);
    }
    if (filters.submittedByUserId) {
      query = query.eq("submitted_by", filters.submittedByUserId);
    }
    if (filters.reviewByUserId) {
      query = query.eq("review_by", filters.reviewByUserId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Supabase error fetching documents:", error);
      throw new Error(
        `Failed to fetch documents: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return (data || [])
      .map(transformApiDocument)
      .filter((d): d is ApiDocument => d !== null);
  } catch (error: any) {
    console.error("Error in getDocuments:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while fetching documents"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const getDocumentById = async (
  documentId: string
): Promise<ApiDocument | null> => {
  if (!documentId) return null;
  try {
    const { data, error } = await supabase
      .from("documents")
      .select(
        `
        *,
        doc_type:document_types ( doc_type_id, service_id, doc_type_name, description, created_at, updated_at ),
        submittedByUser:profiles!documents_submitted_by_fkey ( id, full_name, role, email ),
        reviewByUser:profiles!documents_review_by_fkey ( id, full_name, role, email )
      `
      )
      .eq("document_id", documentId)
      .single();

    if (error) {
      console.error(`Supabase error fetching document ${documentId}:`, error);
      if (error.code === "PGRST116") return null; // Not Found
      throw new Error(
        `Failed to fetch document ${documentId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return transformApiDocument(data);
  } catch (error: any) {
    console.error(`Error in getDocumentById ${documentId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching document ${documentId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const createDocument = async (
  documentData: DocumentCreateData
): Promise<ApiDocument> => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .insert([documentData])
      .select(
        `
        *,
        doc_type:document_types ( doc_type_id, service_id, doc_type_name, description, created_at, updated_at ),
        submittedByUser:profiles!documents_submitted_by_fkey ( id, full_name, role, email ),
        reviewByUser:profiles!documents_review_by_fkey ( id, full_name, role, email )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating document:", error);
      throw new Error(
        `Failed to create document: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    const newDocument = transformApiDocument(data);
    if (!newDocument)
      throw new Error("Failed to transform created document data.");

    return newDocument;
  } catch (error: any) {
    console.error("Error in createDocument:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while creating the document"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const updateDocument = async (
  documentId: string,
  documentData: DocumentUpdateData
): Promise<ApiDocument> => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .update(documentData)
      .eq("document_id", documentId)
      .select(
        `
        *,
        doc_type:document_types ( doc_type_id, service_id, doc_type_name, description, created_at, updated_at ),
        submittedByUser:profiles!documents_submitted_by_fkey ( id, full_name, role, email ),
        reviewByUser:profiles!documents_review_by_fkey ( id, full_name, role, email )
      `
      )
      .single();

    if (error) {
      console.error(`Supabase error updating document ${documentId}:`, error);
      throw new Error(
        `Failed to update document ${documentId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    const updatedDocument = transformApiDocument(data);
    if (!updatedDocument)
      throw new Error("Failed to transform updated document data.");

    return updatedDocument;
  } catch (error: any) {
    console.error(`Error in updateDocument ${documentId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while updating document ${documentId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("document_id", documentId);

    if (error) {
      console.error(`Supabase error deleting document ${documentId}:`, error);
      throw new Error(
        `Failed to delete document ${documentId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error(`Error in deleteDocument ${documentId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while deleting document ${documentId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const getDocumentsCount = async (caseId: string): Promise<number> => {
  if (!caseId) return 0;
  try {
    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("case_id", caseId);

    if (error) {
      console.error(
        `Supabase error fetching documents count for case ${caseId}:`,
        error
      );
      throw new Error(
        `Failed to fetch documents count for case ${caseId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return count || 0;
  } catch (error: any) {
    console.error(`Error in getDocumentsCount for case ${caseId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching documents count for case ${caseId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const getPendingDocumentsCount = async (
  caseId: string
): Promise<number> => {
  if (!caseId) return 0;
  try {
    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("case_id", caseId)
      .in("status", [
        DocStatus.NOT_SUBMITTED,
        DocStatus.REJECTED,
        DocStatus.CLIENT_ACTION_REQUIRED,
      ]);

    if (error) {
      console.error(
        `Supabase error fetching pending documents count for case ${caseId}:`,
        error
      );
      throw new Error(
        `Failed to fetch pending documents count for case ${caseId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return count || 0;
  } catch (error: any) {
    console.error(
      `Error in getPendingDocumentsCount for case ${caseId}:`,
      error
    );
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching pending documents count for case ${caseId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const getDocumentTypes = async (
  filters: { serviceId?: string | string[] } = {}
): Promise<DocumentType[]> => {
  try {
    let query = supabase.from("document_types").select(
      `
        doc_type_id,
        service_id,
        doc_type_name,
        description,
        created_at,
        updated_at
      `
    );

    if (filters.serviceId) {
      if (Array.isArray(filters.serviceId)) {
        query = query.in("service_id", filters.serviceId);
      } else {
        query = query.eq("service_id", filters.serviceId);
      }
    }

    const { data, error } = await query.order("doc_type_name", {
      ascending: true,
    });

    if (error) {
      console.error("Supabase error fetching document types:", error);
      throw new Error(
        `Failed to fetch document types: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return (
      data?.map((d) => ({
        doc_type_id: d.doc_type_id,
        service_id: d.service_id,
        doc_type_name: d.doc_type_name,
        description: d.description,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })) || []
    );
  } catch (error: any) {
    console.error("Error in getDocumentTypes:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while fetching document types"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};
