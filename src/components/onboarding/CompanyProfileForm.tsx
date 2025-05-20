import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CompanyProfileFormProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  registrationNumber: string;
  setRegistrationNumber: (value: string) => void;
  taxId: string;
  setTaxId: (value: string) => void;
  contactName: string;
  setContactName: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  legalStructure: string;
  setLegalStructure: (value: string) => void;
  countryOfOrigin: string;
  setCountryOfOrigin: (value: string) => void;
  onSubmit: () => void; // Replaced onNext with onSubmit
  isSubmitting: boolean; // Added to handle loading state
  error: string | null; // Added to display errors
}

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  registrationNumber,
  setRegistrationNumber,
  taxId,
  setTaxId,
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
  legalStructure,
  setLegalStructure,
  countryOfOrigin,
  setCountryOfOrigin,
  onSubmit,
  isSubmitting,
  error,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            placeholder="Your company name"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Technology, Manufacturing"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="Company registration number"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="Tax identification number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="legalStructure">Legal Structure</Label>
          <Input
            id="legalStructure"
            value={legalStructure}
            onChange={(e) => setLegalStructure(e.target.value)}
            placeholder="e.g. LLC, Corporation"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
          <Input
            id="countryOfOrigin"
            value={countryOfOrigin}
            onChange={(e) => setCountryOfOrigin(e.target.value)}
            placeholder="Country where company is registered"
          />
        </div>
      </div>

      <h3 className="text-lg font-medium mt-8">Primary Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            placeholder="Full name"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            placeholder="Email address"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="pt-6 text-right">
        <Button
          onClick={onSubmit}
          disabled={
            isSubmitting || !companyName || !contactName || !contactEmail
          }
        >
          {isSubmitting ? "Submitting..." : "Complete Onboarding"}
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
