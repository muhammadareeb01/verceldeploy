// Suggested file: src/components/communications/CommunicationsMainSidebar.tsx
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiCase, Company, Communication } from "@/types/types";
import CommunicationsList from "@/components/communications/CommunicationsList";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCommunicationsQuery,
  communicationKeys,
  useUpdateCommunicationMutation,
  useDeleteCommunicationMutation,
} from "@/hooks/useCommunications";
import { Building } from "lucide-react";

interface CommunicationsMainSidebarProps {
  cases: ApiCase[];
  companies: Company[];
}

const CommunicationsMainSidebar: React.FC<CommunicationsMainSidebarProps> = ({
  cases,
  companies,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [filter, setFilter] = useState("");
  const [hideCompanyNames, setHideCompanyNames] = useState(false);

  // Determine if user is staff/admin to enable actions
  const isStaffOrAdmin = user?.role === "STAFF" || user?.role === "ADMIN";

  // Filter companies and cases based on search input
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(filter.toLowerCase())
  );
  const filteredCases = cases.filter((c) =>
    c.service.service_name.toLowerCase().includes(filter.toLowerCase())
  );

  // Fetch communications based on selected case or company
  const { data: communications = [], isLoading: isCommunicationsLoading } =
    useCommunicationsQuery({
      caseId: selectedCaseId ?? undefined,
      companyId: selectedCaseId ? undefined : selectedCompanyId ?? undefined,
    });

  // Mutation hooks for edit and delete
  const updateMutation = useUpdateCommunicationMutation();
  const deleteMutation = useDeleteCommunicationMutation();

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedCaseId(null);
  };

  const handleCaseClick = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleEdit = (comm: Communication) => {
    updateMutation.mutate(
      {
        communicationId: comm.communication_id,
        data: { content: comm.content },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: communicationKeys.lists(
              selectedCaseId
                ? { caseId: selectedCaseId }
                : { companyId: selectedCompanyId }
            ),
          });
        },
      }
    );
  };

  const handleDelete = (comm: Communication) => {
    deleteMutation.mutate(comm.communication_id);
  };

  return (
    <div className="grid grid-cols-8 h-full">
      {/* Sidebar: Companies/Cases (3 columns) */}
      <div className="col-span-3 border-r h-full">
        <div className="p-2 space-y-4">
          {/* Filter Input */}
          <Input
            placeholder="Search companies or cases..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full"
          />
          {/* Hide Company Names Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hide-company-names"
              checked={hideCompanyNames}
              onCheckedChange={(checked) => setHideCompanyNames(!!checked)}
            />
            <label
              htmlFor="hide-company-names"
              className="text-sm text-muted-foreground"
            >
              Hide company names
            </label>
          </div>
        </div>
        {/* Companies/Cases List */}
        <ScrollArea className="h-[calc(100vh-180px)] pr-4 ">
          <div className="  space-y-4">
            {filter ? (
              // Show filtered results (companies and cases)
              <>
                {filteredCompanies.map((company) => {
                  const companyCases = cases.filter(
                    (c) => c.company_id === company.company_id
                  );
                  return (
                    <div key={company.company_id} className=" p-4 rounded-lg ">
                      {!hideCompanyNames && (
                        <h3
                          className={`text-md font-semibold mb-2 cursor-pointer  hover:text-blue-500 ${
                            selectedCompanyId === company.company_id &&
                            !selectedCaseId
                              ? "text-blue-500"
                              : ""
                          }`}
                          onClick={() => handleCompanyClick(company.company_id)}
                        >
                          {company.name}
                        </h3>
                      )}
                      <ul className="space-y-1 rounded-lg ">
                        {companyCases.map((c) => (
                          <li
                            key={c.case_id}
                            className={`cursor-pointer text-sm px-2 py-1 rounded hover:bg-muted  ${
                              selectedCaseId === c.case_id ? "bg-muted" : ""
                            }`}
                            onClick={() => handleCaseClick(c.case_id)}
                          >
                            {c.service.service_name}
                          </li>
                        ))}
                        {companyCases.length === 0 && (
                          <li className="text-muted-foreground text-sm italic pl-2">
                            No cases for this company
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
                {filteredCases
                  .filter(
                    (c) =>
                      !filteredCompanies.some(
                        (company) => company.company_id === c.company_id
                      )
                  )
                  .map((c) => (
                    <div key={c.case_id} className=" p-4 rounded-lg">
                      <ul className="space-y-1 rounded-lg">
                        <li
                          className={`cursor-pointer text-sm px-2 py-1 rounded hover:bg-muted ${
                            selectedCaseId === c.case_id ? "bg-muted" : ""
                          }`}
                          onClick={() => handleCaseClick(c.case_id)}
                        >
                          {c.service.service_name}
                        </li>
                      </ul>
                    </div>
                  ))}
              </>
            ) : (
              // Show all companies and cases
              companies.map((company) => {
                const companyCases = cases.filter(
                  (c) => c.company_id === company.company_id
                );
                return (
                  <div
                    key={company.company_id}
                    className="mb-4  bg-white hover:bg-muted p-4 rounded-lg items-start justify-start"
                  >
                    {!hideCompanyNames && (
                      <h3
                        className={`text-md text-left font-semibold mb-2 cursor-pointer hover:text-blue-500 ${
                          selectedCompanyId === company.company_id &&
                          !selectedCaseId
                            ? "text-blue-500 "
                            : ""
                        }`}
                        onClick={() => handleCompanyClick(company.company_id)}
                      >
                        <Building className="h-5 w-5 mr-2 mb-1 inline-flex" />
                        {company.name}
                      </h3>
                    )}
                    <ul className="space-y-1 bg-primary/5 rounded-lg">
                      {companyCases.map((c) => (
                        <li
                          key={c.case_id}
                          className={`cursor-pointer text-left text-sm px-2 py-1 rounded hover:bg-primary/10 ${
                            selectedCaseId === c.case_id
                              ? "font-bold text-blue-500 "
                              : ""
                          }`}
                          onClick={() => handleCaseClick(c.case_id)}
                        >
                          {c.service.service_name}
                        </li>
                      ))}
                      {companyCases.length === 0 && (
                        <li className="text-muted-foreground text-sm italic pl-2">
                          No cases for this company
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main content: Communications (5 columns) */}
      <div className="col-span-5 h-full  mt-2 pl-3">
        {selectedCaseId || selectedCompanyId ? (
          <CommunicationsList
            communications={communications}
            isLoading={isCommunicationsLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            disableActions={!isStaffOrAdmin}
          />
        ) : (
          <p className="text-muted-foreground">
            Select a case or company to view communications.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunicationsMainSidebar;
