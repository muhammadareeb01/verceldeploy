// Suggested file: src/components/client-dashboard/ClientCaseGrid.tsx
import React from "react";
import { ClientCaseCard } from "./ClientCaseCard"; // Import the card component
import type { ClientCase } from "@/types/types"; // Adjust path to your types file

interface ClientCaseGridProps {
  cases: ClientCase[];
  isLoadingEnriched: boolean; // Pass loading state for enriched data
}

export const ClientCaseGrid: React.FC<ClientCaseGridProps> = ({
  cases,
  isLoadingEnriched,
}) => {
  if (cases.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          No cases found with the selected filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((caseItem) => (
        <ClientCaseCard
          key={caseItem.case_id}
          caseItem={caseItem}
          isLoadingEnriched={isLoadingEnriched}
        />
      ))}
    </div>
  );
};
