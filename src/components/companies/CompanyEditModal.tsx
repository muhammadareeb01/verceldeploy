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
import { AlertCircle, Loader2 } from "lucide-react"; // Added Loader2
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Company, CompanyUpdateData, UserProfile } from "@/types/types"; // Import necessary types
// Import react-query hooks
import { useQuery } from "@tanstack/react-query";
import { useUpdateCompanyMutation } from "@/hooks/useCompanies"; // Import the update mutation hook
// Assuming supabase client is needed for fetching account managers
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompanyEditModalProps {
  company: Company; // The company object to edit
  isOpen: boolean;
  onClose: () => void;
  // Removed onCompanyUpdated prop as mutation hook handles cache invalidation
}

// Hook to fetch potential account managers
const useAccountManagersQuery = () => {
  return useQuery<UserProfile[], Error>({
    queryKey: ["accountManagers"], // Unique query key for account managers
    queryFn: async () => {
      // Adjust this query to fetch users with roles that can be account managers
      const { data, error } = await supabase
        .from("profiles") // Assuming account managers are in the profiles table
        .select("id, full_name, role, email") // Select necessary fields for UserProfile
        .in("role", ["ADMIN", "MANAGER", "ACCOUNT_MANAGER"]); // Filter by relevant roles

      if (error) {
        console.error("Supabase error fetching account managers:", error);
        throw new Error(
          `Failed to fetch account managers: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
        );
      }
      // Ensure data conforms to UserProfile[] structure if needed elsewhere,
      // but for this select, id and full_name are sufficient.
      // Casting to UserProfile[] for type safety based on select fields.
      return data as UserProfile[];
    },
    // This query can run immediately or when the modal opens
    // enabled: isOpen, // Uncomment if you only want to fetch when the modal is open
  });
};

export const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  company,
  isOpen,
  onClose,
  // onCompanyUpdated, // Removed prop
}) => {
  // State for form fields, initialized with company data
  const [name, setName] = useState(company.name || "");
  const [industry, setIndustry] = useState(company.industry || "");
  const [registrationNumber, setRegistrationNumber] = useState(
    company.registration_number || ""
  );
  const [taxId, setTaxId] = useState(company.tax_id || "");
  const [primaryContactName, setPrimaryContactName] = useState(
    company.primary_contact_name || ""
  );
  const [primaryContactEmail, setPrimaryContactEmail] = useState(
    company.primary_contact_email || ""
  );
  const [primaryContactPhone, setPrimaryContactPhone] = useState(
    company.primary_contact_phone || ""
  );
  const [legalStructure, setLegalStructure] = useState(
    company.legal_structure || ""
  );
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    company.country_of_origin || ""
  );
  const [accountManagerId, setAccountManagerId] = useState<string | null>(
    company.account_manager_id || null
  );

  // Use the update mutation hook
  const updateMutation = useUpdateCompanyMutation();
  // Use the account managers query hook
  const { data: accountManagers = [], isLoading: isLoadingManagers } =
    useAccountManagersQuery();

  // Reset form state when the modal opens with a new company
  useEffect(() => {
    if (isOpen && company) {
      setName(company.name || "");
      setIndustry(company.industry || "");
      setRegistrationNumber(company.registration_number || "");
      setTaxId(company.tax_id || "");
      setPrimaryContactName(company.primary_contact_name || "");
      setPrimaryContactEmail(company.primary_contact_email || "");
      setPrimaryContactPhone(company.primary_contact_phone || "");
      setLegalStructure(company.legal_structure || "");
      setCountryOfOrigin(company.country_of_origin || "");
      setAccountManagerId(company.account_manager_id || null);
      // Error state is now managed by the mutation hook's error property if needed for display
      // setError(null); // Removed local error state
    }
  }, [isOpen, company]); // Depend on isOpen and company prop

  // Use mutation hook's state for submitting and error
  const isSubmitting = updateMutation.isPending;
  const error = updateMutation.error; // Get error from mutation hook

  const handleSave = async () => {
    // Basic validation
    if (!name.trim()) {
      // Use toast for validation errors, not mutation error state
      toast.error("Validation Error", {
        description: "Company name is required.",
      });
      return;
    }

    // Prepare updated company data (using CompanyUpdateData DTO)
    const updatedData: CompanyUpdateData = {
      name: name,
      industry: industry || null,
      registration_number: registrationNumber || null,
      tax_id: taxId || null,
      primary_contact_name: primaryContactName || null,
      primary_contact_email: primaryContactEmail || null,
      primary_contact_phone: primaryContactPhone || null,
      legal_structure: legalStructure || null,
      country_of_origin: countryOfOrigin || null,
      account_manager_id: accountManagerId, // accountManagerId is already null or string UUID
      // updated_at is handled by DB
    };

    // Trigger the mutation
    updateMutation.mutate(
      {
        companyId: company.company_id,
        data: updatedData,
      },
      {
        onSuccess: (updatedCompany) => {
          // onSuccess logic is primarily handled in the hook definition (cache invalidation, toast)
          // Any additional modal-specific success logic can go here
          // onCompanyUpdated(updatedCompany); // Removed callback
          onClose(); // Close the modal on success
        },
        onError: (err) => {
          // onError logic is primarily handled in the hook definition (toast)
          // Any additional modal-specific error logic can go here
          console.error("Mutation error in modal:", err); // Log the error
          // Error toast is already shown by the hook's onError
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company: {company.name}</DialogTitle>
          <DialogDescription>
            Make changes to the company's profile here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        {/* Display mutation error if it exists */}
        {updateMutation.isError && updateMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            {/* Display the specific error message from the mutation hook */}
            <AlertDescription>{updateMutation.error.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Company Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting} // Disable input while submitting
            />
          </div>
          {/* Industry */}
          <div className="grid gap-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Registration Number */}
          <div className="grid gap-2">
            <Label htmlFor="registration-number">Registration Number</Label>
            <Input
              id="registration-number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Tax ID */}
          <div className="grid gap-2">
            <Label htmlFor="tax-id">Tax ID</Label>
            <Input
              id="tax-id"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Primary Contact Name */}
          <div className="grid gap-2">
            <Label htmlFor="primary-contact-name">Primary Contact Name</Label>
            <Input
              id="primary-contact-name"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Primary Contact Email */}
          <div className="grid gap-2">
            <Label htmlFor="primary-contact-email">Primary Contact Email</Label>
            <Input
              id="primary-contact-email"
              type="email"
              value={primaryContactEmail}
              onChange={(e) => setPrimaryContactEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Primary Contact Phone */}
          <div className="grid gap-2">
            <Label htmlFor="primary-contact-phone">Primary Contact Phone</Label>
            <Input
              id="primary-contact-phone"
              type="tel"
              value={primaryContactPhone}
              onChange={(e) => setPrimaryContactPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Legal Structure */}
          <div className="grid gap-2">
            <Label htmlFor="legal-structure">Legal Structure</Label>
            <Input
              id="legal-structure"
              value={legalStructure}
              onChange={(e) => setLegalStructure(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Country of Origin */}
          <div className="grid gap-2">
            <Label htmlFor="country-of-origin">Country of Origin</Label>
            <Input
              id="country-of-origin"
              value={countryOfOrigin}
              onChange={(e) => setCountryOfOrigin(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {/* Account Manager */}
          <div className="grid gap-2">
            <Label htmlFor="account-manager">Account Manager</Label>
            <Select
              // Set the value to the accountManagerId if it exists, otherwise use the special "null-account-manager" string
              value={accountManagerId || "null-account-manager"}
              onValueChange={(value) =>
                // If the selected value is the special string, set accountManagerId to null, otherwise set it to the value
                setAccountManagerId(
                  value === "null-account-manager" ? null : value
                )
              }
              disabled={isLoadingManagers || isSubmitting} // Disable while loading managers or submitting
            >
              <SelectTrigger id="account-manager">
                <SelectValue
                  placeholder={
                    isLoadingManagers
                      ? "Loading managers..."
                      : "Select account manager"
                  }
                />
                {/* Optional: Add a spinner inside the trigger when loading managers */}
                {isLoadingManagers && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </SelectTrigger>
              <SelectContent>
                {/* Use a non-empty string value for the "None" item */}
                <SelectItem value="null-account-manager">None</SelectItem>
                {/* Render managers only if loaded and available */}
                {!isLoadingManagers &&
                  accountManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name}
                    </SelectItem>
                  ))}
                {/* Optional: Add a loading item if managers are loading */}
                {isLoadingManagers && (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
