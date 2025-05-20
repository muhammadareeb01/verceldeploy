import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyProfileForm } from "@/components/onboarding/CompanyProfileForm";
import { Button } from "@/components/ui/button"; // Assuming you use Shadcn Button
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ClientOnboarding = () => {
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and auth loading state
  const navigate = useNavigate();

  // Company profile data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [legalStructure, setLegalStructure] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false); // New state to track if profile exists
  const [isCheckingProfile, setIsCheckingProfile] = useState(true); // State to track profile check loading

  useEffect(() => {
    // Fetch company profile when user is available and not already checking
    const checkCompanyProfile = async () => {
      if (!user) {
        setIsCheckingProfile(false); // If no user, finish checking immediately
        return;
      }

      setIsCheckingProfile(true); // Start checking
      setError(null); // Clear previous errors

      try {
        const { data, error } = await supabase
          .from("companies")
          .select(" company_id") // Select any column, we just need to know if a row exists
          .eq(" company_id", user.id)
          .single(); // Use single() to check for exactly one row

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows found", which is expected if profile doesn't exist
          throw error;
        }

        if (data) {
          // Company profile exists
          console.log("Company profile found for user", user.id);
          setHasCompanyProfile(true);
        } else {
          // No company profile found
          console.log("No company profile found for user", user.id);
          setHasCompanyProfile(false);

          // Pre-fill contact name, email, and phone if available from user profile
          setContactName(user.user_metadata?.full_name || "Talha Khan");
          setContactEmail(user.email || "info@dijitze.com");
          setContactPhone(user.user_metadata?.phone || "442-421-5593");
        }
      } catch (err: any) {
        console.error("Error checking company profile:", err);
        setError(err.message || "Failed to check company profile status.");
        // Decide how to handle error - maybe still show the form with an error message
        setHasCompanyProfile(false); // Assume no profile exists on error for now
      } finally {
        setIsCheckingProfile(false); // Finish checking
      }
    };

    // Only check if user is available and we haven't checked yet, or if user changes
    if (user) {
      checkCompanyProfile();
    } else {
      // If user becomes null (e.g., signed out), reset state
      setHasCompanyProfile(false);
      setIsCheckingProfile(false); // No user means no profile to check
    }
  }, [user]); // Re-run when user changes

  // Handle onboarding completion
  const handleSubmit = async () => {
    if (!user) return; // Should not happen if ProtectedRoute is used, but good practice

    setIsSubmitting(true);
    setError(null); // Clear previous errors

    try {
      // Create company profile
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          company_id: user.id, // Link company to the user ID
          name: companyName,
          industry,
          registration_number: registrationNumber,
          tax_id: taxId,
          primary_contact_name: contactName,
          primary_contact_email: contactEmail,
          primary_contact_phone: contactPhone,
          legal_structure: legalStructure,
          country_of_origin: countryOfOrigin ? countryOfOrigin.charAt(0) : null, // Store first character as country code, handle empty string
        })
        .select(" company_id") // Select  company_id to confirm insertion
        .single();

      if (companyError) throw companyError;

      toast.success("Onboarding completed successfully!", {
        description:
          "Your company profile has been set up, Talha Khan. Contact: 442-421-5593 | info@dijitze.com",
      });

      // After successful creation, update state and navigate
      setHasCompanyProfile(true); // Set to true since profile is now created
      navigate("/client-dashboard");
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      setError(err.message || "Failed to complete onboarding");
      toast.error("Failed to complete onboarding", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth or profile status
  if (isAuthLoading || isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in after auth loading, ProtectedRoute should handle this.
  // This check is a fallback, but ProtectedRoute should prevent reaching here.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>You need to be logged in to access this page.</p>
      </div>
    );
  }

  // Render based on whether company profile exists
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Tabadl</h1>
            <p className="text-gray-600 mt-2">
              {hasCompanyProfile
                ? "Your company profile is complete."
                : "Let's set up your company profile - Talha Khan. Contact: 442-421-5593 | info@dijitze.com"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {error && ( // Display general error if any occurred during check or submission
              <div className="mb-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {hasCompanyProfile ? (
              // Show message and button if profile exists
              <div className="text-center space-y-4">
                <p className="text-lg text-gray-700">
                  You have already completed your company profile.
                </p>
                <Button onClick={() => navigate("/client-dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              // Show the form if profile does not exist
              <CompanyProfileForm
                companyName={companyName}
                setCompanyName={setCompanyName}
                industry={industry}
                setIndustry={setIndustry}
                registrationNumber={registrationNumber}
                setRegistrationNumber={setRegistrationNumber}
                taxId={taxId}
                setTaxId={setTaxId}
                contactName={contactName}
                setContactName={setContactName}
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
                contactPhone={contactPhone}
                setContactPhone={setContactPhone}
                legalStructure={legalStructure}
                setLegalStructure={setLegalStructure}
                countryOfOrigin={countryOfOrigin}
                setCountryOfOrigin={setCountryOfOrigin}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                error={null} // Pass null here as general error is displayed above
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboarding;
