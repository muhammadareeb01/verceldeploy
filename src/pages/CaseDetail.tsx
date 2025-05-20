// Suggested file: src/views/CaseDetail.tsx

import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import Link
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Building,
  ClipboardList,
  Calendar,
  User as UserIcon,
} from "lucide-react"; // Import necessary icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; // Import format from date-fns}
// Import hooks for fetching data
import { useCaseByIdQuery } from "@/hooks/useCases"; // Adjust path

// Import modular section components
import CaseTasksSection from "@/components/cases/CaseTasksSection"; // Adjust path
import CaseDocumentsSection from "@/components/cases/CaseDocumentsSection"; // Adjust path
import CasePaymentsSection from "@/components/cases/CasePaymentsSection"; // Adjust path
import CaseCommunicationsSection from "@/components/cases/CaseCommunicationsSection"; // Adjust path

import { ApiCase } from "@/types/types"; // Adjust path

const CaseDetail = () => {
  // Get the caseId from the URL parameters
  const { id: caseId } = useParams<{ id: string }>(); // Renamed id to caseId for clarity

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/cases");
  };

  // --- Data Fetching using Hooks ---

  // Fetch the specific case details
  // The child components will fetch their own data based on caseId
  const {
    data: caseDetail,
    isLoading: isLoadingCase,
    error: caseError,
  } = useCaseByIdQuery(caseId);

  // --- Error Handling ---
  // Display error using toast if case detail fetching fails
  useEffect(() => {
    if (caseError) {
      toast.error("Case Error", { description: caseError.message });
    }
    // Child components will handle their own data fetching errors
  }, [caseError]);

  // --- Loading State ---
  // Only show main loading spinner while fetching the case detail itself
  if (isLoadingCase) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-lg text-muted-foreground">
          Loading case details...
        </span>
      </div>
    );
  }

  // --- Not Found State ---
  if (!caseDetail) {
    // caseId is available from useParams even if caseDetail is null
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Case Not Found
          </h2>
          <p className="text-muted-foreground">
            The case with ID "{caseId}" could not be loaded or does not exist.
            Contact Talha Khan at 442-421-5593 or info@dijitze.com.
          </p>
          {/* Add a link back to the cases list */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/cases")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Case Details ---
  // Destructure caseDetail for easier access
  const {
    case_id,
    company,
    service,
    assignedUser, // Use assignedUser from the joined data
    created_at,
    notes,
    // Add other fields from ApiCase as needed
  } = caseDetail;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <Button variant="default" size="sm" onClick={() => navigate("/cases")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>

        <Button asChild>
          <Link to={`/cases/${case_id}/edit`}>Edit Case</Link>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {service?.service_name || "Unknown Service"}
          </h1>
          <p className="text-muted-foreground">Details for case {case_id}</p>
        </div>
        {/* Link to edit the case */}
      </div>

      {/* Case Information */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company</Label>
              <p className="font-semibold">
                <Building className="inline-block h-4 w-4 mr-1" />{" "}
                {/* Use mr-1 */}
                {company?.name || "Unknown Company"}
              </p>
            </div>
            <div>
              <Label>Service</Label>
              <p className="font-semibold">
                <ClipboardList className="inline-block h-4 w-4 mr-1" />{" "}
                {/* Use mr-1 */}
                {service?.service_name || "Unknown Service"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Assigned To</Label>
              <p className="font-semibold">
                <UserIcon className="inline-block h-4 w-4 mr-1" />{" "}
                {/* Use mr-1 */}
                {assignedUser?.full_name || "Unassigned"}{" "}
                {/* Display assigned user's name */}
              </p>
            </div>
            <div>
              <Label>Created At</Label>
              <p className="font-semibold">
                <Calendar className="inline-block h-4 w-4 mr-1" />{" "}
                {/* Use mr-1 */}
                {created_at
                  ? format(new Date(created_at), "MMM dd, yyyy")
                  : "N/A"}{" "}
                {/* Format date */}
              </p>
            </div>
            {/* Add other relevant case info fields here */}
            {/* Example: Status, Priority, Dates */}
            {/* <div>
                <Label>Status</Label>
                <p className="font-semibold">{caseDetail.case_status}</p>
             </div>
             <div>
                <Label>Target Date</Label>
                <p className="font-semibold">{caseDetail.target_date ? format(new Date(caseDetail.target_date), "MMM dd, yyyy") : 'N/A'}</p>
             </div> */}
          </div>
          <div>
            <Label>Description</Label>
            <p>{notes || "No description provided."}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section - Use the dedicated component */}
      <CaseTasksSection caseId={case_id} />

      {/* Documents Section - Use the dedicated component */}
      <CaseDocumentsSection caseId={case_id} />

      {/* Payments Section - Use the dedicated component */}
      <CasePaymentsSection caseId={case_id} />

      {/* Communications Section - Use the dedicated component */}
      {/* The communications section component fetches its own data */}
      <CaseCommunicationsSection caseId={case_id} />

      {/* Other sections like Banking Services, Visa Services would also be separate components */}
      {/* Example: <CaseBankingServicesSection caseId={case_id} /> */}
      {/* Example: <CaseVisaServicesSection caseId={case_id} /> */}

      {/* Modals are now managed within their respective section components */}
    </div>
  );
};

export default CaseDetail;
