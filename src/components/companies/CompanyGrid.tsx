
// src/components/companies/CompanyGrid.tsx
import React from "react";
import { Company } from "@/types/types";
import CompanyCard from "@/components/companies/CompanyCard";

interface CompanyGridProps {
  companies: Company[];
  isLoading: boolean;
  onCompanyClick: (company: Company) => void;
}

const CompanyGrid: React.FC<CompanyGridProps> = ({ 
  companies, 
  isLoading, 
  onCompanyClick 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-64 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No companies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.company_id}
          company={company}
          onClick={() => onCompanyClick(company)}
        />
      ))}
    </div>
  );
};

export default CompanyGrid;
