import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCompanyByIdQuery,
  useDeleteCompanyMutation,
} from "@/hooks/useCompanies";
import { useCasesByCompanyIdQuery } from "@/hooks/useCases";
import { useDocumentsQuery } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Clock,
} from "lucide-react";
import { CompanyEditModal } from "@/components/companies/CompanyEditModal";

// Import our new components
import CompanyCasesSection from "@/components/companies/CompanyCasesSection";
import CompanyDocumentsSection from "@/components/companies/CompanyDocumentsSection";
import DeleteCompanyDialog from "@/components/companies/DeleteCompanyDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeaderActions from "@/components/layout/HeaderActions";

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch company data
  const {
    data: company,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyByIdQuery(id);

  // Fetch company cases
  const {
    data: companyCases = [],
    isLoading: isLoadingCases,
    error: casesError,
  } = useCasesByCompanyIdQuery(id);

  // Fetch company documents
  const {
    data: companyDocuments = [],
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useDocumentsQuery({ companyId: id });

  // Delete company mutation
  const deleteMutation = useDeleteCompanyMutation();

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Company deleted successfully");
      navigate("/companies");
    } catch (error: any) {
      toast.error(`Failed to delete company: ${error.message}`);
    }
  };

  if (isLoadingCompany) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">Error Loading Company</h3>
          <p className="mt-1">
            {companyError?.message || "Could not find the requested company"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 br-10"
            onClick={() => navigate("/companies")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 space-y-6">
      <HeaderActions
        backLink="/companies"
        title={{
          icon: <Building className="h-6 w-6" />,
          text: company.name,
        }}
        buttons={[
          {
            label: "Edit",
            onClick: () => setIsEditModalOpen(true),
            variant: "outline",
            icon: <Edit className="mr-2 h-4 w-4" />,
          },
          {
            label: "Delete",
            onClick: () => setIsDeleteDialogOpen(true),
            variant: "destructive",
            icon: <Trash2 className="mr-2 h-4 w-4" />,
          },
        ]}
      />
      {/* Header with Navigation and Actions */}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Company Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" /> Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Industry</p>
              <p className="bg-primary/5 rounded-lg p-4 ">
                {company.industry || "Not specified"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {" "}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Country of Origin
                </p>

                <p className="bg-primary/5 rounded-lg p-4 flex align-middle ">
                  <MapPin className="h-6 w-6 mr-2" />

                  <span>{company.country_of_origin || "Not specified"}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 ">
                  Registration Number
                </p>
                <p className="bg-primary/5 rounded-lg p-4 ">
                  {company.registration_number || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tax ID</p>
                <p className="bg-primary/5 rounded-lg p-4 ">
                  {company.tax_id || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1   ">
                Primary Contact
              </p>
              <p className="bg-primary/5 rounded-lg p-4 ">
                {company.primary_contact_name || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1 ">Email</p>
              <div className="flex items-center bg-primary/5 rounded-lg p-4 ">
                <Mail className="h-4 w-4 mr-2" />
                <p>{company.primary_contact_email || "Not specified"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <div className="flex items-center bg-primary/5 rounded-lg p-4 ">
                <Phone className="h-4 w-4 mr-2" />
                <p>{company.primary_contact_phone || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Manager Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Account Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.account_manager_id && company.user_id ? (
              <div className="space-y-2 ">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 bg-primary/5 rounded-lg p-4 ">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {company.user_id || "Unknown Name"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No account manager assigned
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 ">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Creation Date
              </p>
              <div className="flex items-center bg-primary/5 rounded-lg p-4 ">
                <Clock className="h-4 w-4 mr-2" />
                <p>
                  {company.created_at
                    ? new Date(company.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <div className="flex items-center bg-primary/5 rounded-lg p-4 ">
                <Clock className="h-4 w-4 mr-2" />
                <p>
                  {company.updated_at
                    ? new Date(company.updated_at).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Company Cases */}
      <CompanyCasesSection
        companyId={id || ""}
        cases={companyCases}
        isLoading={isLoadingCases}
        error={casesError}
      />

      {/* Company Documents */}
      <div className="mt-6">
        <CompanyDocumentsSection
          companyId={id}
          documents={companyDocuments}
          isLoading={isLoadingDocuments}
          error={documentsError}
        />
      </div>

      {/* Edit Modal */}
      <CompanyEditModal
        company={company}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Dialog */}
      <DeleteCompanyDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        companyName={company.name}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default CompanyDetail;
