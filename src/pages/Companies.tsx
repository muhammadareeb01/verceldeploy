
// src/pages/Companies.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompaniesQuery, useDeleteCompanyMutation } from "@/hooks/useCompanies";
import { Company } from "@/types/types";
import { toast } from "sonner";

// Import our new components
import CompanyHeader from "@/components/companies/CompanyHeader";
import CompanyFilters from "@/components/companies/CompanyFilters";
import CompanyGrid from "@/components/companies/CompanyGrid";
import CompanyDetailDialog from "@/components/companies/CompanyDetailDialog";
import DeleteCompanyDialog from "@/components/companies/DeleteCompanyDialog";

const Companies = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompaniesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Mutation for deleting a company
  const deleteMutation = useDeleteCompanyMutation();
  
  // Since you mentioned "no create functionality", I'm not including add company features
  
  // Filter companies based on search term
  const filteredCompanies = companies.filter(
    (company) =>
      (company.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.primary_contact_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.country_of_origin || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanyClick = (company: Company) => {
    navigate(`/companies/${company.company_id}`);
  };
  
  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailDialogOpen(true);
  };
  
  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;
    
    try {
      await deleteMutation.mutateAsync(selectedCompany.company_id);
      toast.success(`Company "${selectedCompany.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    } catch (error: any) {
      toast.error(`Failed to delete company: ${error.message}`);
    }
  };
  
  const instructionsList = [
    "Browse through available companies",
    "Click on a company card to view detailed information",
    "Use the search bar to filter companies by name, industry, or contact",
    "Access company details page for more information and related data"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <CompanyHeader
        title="Companies"
        description="Manage client companies and their details"
        instructions={instructionsList}
      />
      
      {/* Filters */}
      <CompanyFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {/* Company Grid */}
      <CompanyGrid
        companies={filteredCompanies}
        isLoading={isLoading}
        onCompanyClick={handleCompanyClick}
      />
      
      {/* Detail Dialog - only shown when a company is selected */}
      {selectedCompany && (
        <CompanyDetailDialog
          company={selectedCompany}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          onEdit={() => navigate(`/companies/${selectedCompany.company_id}`)}
          onDelete={() => {
            setIsDetailDialogOpen(false);
            setIsDeleteDialogOpen(true);
          }}
        />
      )}
      
      {/* Delete Dialog */}
      {selectedCompany && (
        <DeleteCompanyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          companyName={selectedCompany.name}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Companies;
