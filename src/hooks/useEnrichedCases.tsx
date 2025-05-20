
import { useState, useEffect } from "react";
import { useMemo } from "react";
import { useServiceByIdQuery } from "@/hooks/useServices";
import { useTasksCountByFilters } from "@/hooks/useTasks";
import {
  useDocumentsQuery,
  useDocumentsCountQuery,
} from "@/hooks/useDocuments";
import { DocStatus } from "@/types/documents";
import type { ApiCase, ClientCase } from "@/types/types";

// Custom hook to get pending documents count
const usePendingDocumentsCount = (caseId: string) => {
  const { data: documents = [] } = useDocumentsQuery({
    caseId,
    status: [
      DocStatus.NOT_SUBMITTED,
      DocStatus.REJECTED,
      DocStatus.CLIENT_ACTION_REQUIRED
    ]
  });
  
  return { data: documents.length };
};

// Custom hook to enrich a single case
const useEnrichedCase = (
  caseItem: ApiCase
): {
  enrichedCase: ClientCase;
  isLoading: boolean;
  error: Error | null;
} => {
  const serviceQuery = useServiceByIdQuery(caseItem.service_id);
  const taskCountQuery = useTasksCountByFilters({ caseId: caseItem.case_id });
  const documentCountQuery = useDocumentsCountQuery(caseItem.case_id);
  const pendingDocumentCountQuery = usePendingDocumentsCount(caseItem.case_id);

  const enrichedCase = useMemo(
    () =>
      ({
        ...caseItem,
        service: serviceQuery.data || null,
        tasks_count: taskCountQuery.data || 0,
        documents_count: documentCountQuery.data || 0,
        pending_documents: pendingDocumentCountQuery.data || 0,
      } as ClientCase),
    [
      caseItem,
      serviceQuery.data,
      taskCountQuery.data,
      documentCountQuery.data,
      pendingDocumentCountQuery.data,
    ]
  );

  const isLoading =
    serviceQuery.isLoading ||
    taskCountQuery.isLoading ||
    documentCountQuery.isLoading;
  const error =
    serviceQuery.error ||
    taskCountQuery.error ||
    documentCountQuery.error ||
    null;

  return { enrichedCase, isLoading, error };
};

export const useEnrichedCases = (
  cases: ApiCase[] | undefined,
  companyId: string | undefined
): {
  enrichedCases: ClientCase[];
  isLoadingEnrichedCases: boolean;
  enrichedCasesError: Error | null;
} => {
  // Return early if no cases or companyId
  if (!cases || !companyId) {
    return {
      enrichedCases: [],
      isLoadingEnrichedCases: false,
      enrichedCasesError: null,
    };
  }

  // Limit to first 20 cases to prevent excessive hook calls
  const maxCases = 20;
  const limitedCases = cases.slice(0, maxCases);

  // Enrich each case
  // Enrich each case
  const [enrichedCaseResults, setEnrichedCaseResults] = useState([]);
  const [isLoadingEnrichment, setIsLoadingEnrichment] = useState(true);
  const [errorEnrichment, setErrorEnrichment] = useState(null);

  useEffect(() => {
    const enrichCases = async () => {
      setIsLoadingEnrichment(true);
      setErrorEnrichment(null);
      const results = await Promise.all(
        limitedCases.map(async (caseItem) => {
          try {
            const enriched = await useEnrichedCase(caseItem);
            return enriched;
          } catch (error) {
            console.error("Error enriching case:", error);
            return caseItem;
          }
        })
      );
      setEnrichedCaseResults(results);
      setIsLoadingEnrichment(false);
    };

    if (limitedCases.length > 0) {
      enrichCases();
    } else {
      setEnrichedCaseResults([]);
      setIsLoadingEnrichment(false);
    }
  }, [limitedCases]);
  // Combine results
  const enrichedCases = useMemo(() => {
    return enrichedCaseResults.map((result) => result.enrichedCase);
  }, [enrichedCaseResults]);

  const isLoadingEnrichedCases = enrichedCaseResults.some(
    (result) => result.isLoading
  );
  const enrichedCasesError =
    enrichedCaseResults.find((result) => result.error)?.error || null;

  return {
    enrichedCases,
    isLoadingEnrichedCases,
    enrichedCasesError,
  };
};
