
// src/pages/Client/ClientCommunications.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunicationsQuery } from "@/hooks/useCommunications";
import { useCasesQuery } from "@/hooks/useCases";
import { useCompanyByUserIdQuery } from "@/hooks/useCompanies";
import CommunicationsList from "@/components/communications/CommunicationsList";
import ClientNewCommunicationModal from "@/components/communications/ClientNewCommunicationModal";
import { ClientDashboardHeader } from "@/components/client-dashboard/ClientDashboardHeader";
import { ClientDashboardLoading } from "@/components/client-dashboard/ClientDashboardLoading";
import { ClientDashboardError } from "@/components/client-dashboard/ClientDashboardError";
import { ApiCommunication, ApiCase } from "@/types/types";

const ClientCommunications: React.FC = () => {
  const { user } = useAuth();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Fetch client's company
  const {
    data: clientCompany,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyByUserIdQuery(user?.id);

  // Fetch communications for the client
  const {
    data: communications = [],
    isLoading: isLoadingCommunications,
    error: communicationsError,
  } = useCommunicationsQuery({ userId: user?.id });

  // Fetch cases for the client
  const {
    data: cases = [],
    isLoading: isLoadingCases,
    error: casesError,
  } = useCasesQuery({ userId: user?.id });

  useEffect(() => {
    if (cases && cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].case_id);
    }
  }, [cases, selectedCaseId]);

  const isLoading = isLoadingCases || isLoadingCommunications || isLoadingCompany;
  const error = communicationsError || casesError || companyError;

  if (isLoading) {
    return <ClientDashboardLoading />;
  }

  if (error) {
    return (
      <ClientDashboardError
        message="Failed to load communications data"
      />
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <ClientDashboardHeader clientCompany={clientCompany} />
        <Button 
          onClick={() => setIsNewModalOpen(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {(cases?.length || 0) === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">No Cases Found</h3>
          <p className="text-muted-foreground mt-2">
            You don't have any active cases to communicate about.
          </p>
        </Card>
      ) : (
        <Tabs defaultValue={selectedCaseId || "all"} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="mb-4 w-full flex flex-nowrap">
              <TabsTrigger value="all" className="flex-shrink-0">All Communications</TabsTrigger>
              {cases?.map(caseItem => (
                <TabsTrigger key={caseItem.case_id} value={caseItem.case_id} className="flex-shrink-0">
                  {caseItem.service?.service_name || `Case ${caseItem.case_id.substring(0, 8)}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all">
            {communications.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">No Communications Yet</h3>
                <p className="text-muted-foreground mt-2">
                  You haven't received or sent any messages about your cases yet.
                </p>
                <Button onClick={() => setIsNewModalOpen(true)} className="mt-4">
                  Start a Conversation
                </Button>
              </Card>
            ) : (
              <CommunicationsList 
                communications={communications}
                isLoading={false}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          </TabsContent>

          {cases?.map(caseItem => {
            const caseCommunications = communications.filter(
              comm => comm.case_id === caseItem.case_id
            );
            
            return (
              <TabsContent key={caseItem.case_id} value={caseItem.case_id}>
                {caseCommunications.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold mt-4">No Communications for This Case</h3>
                    <p className="text-muted-foreground mt-2">
                      You haven't received or sent any messages about this case yet.
                    </p>
                    <Button 
                      onClick={() => {
                        setSelectedCaseId(caseItem.case_id);
                        setIsNewModalOpen(true);
                      }} 
                      className="mt-4"
                    >
                      Start a Conversation
                    </Button>
                  </Card>
                ) : (
                  <CommunicationsList 
                    communications={caseCommunications}
                    isLoading={false}
                    onEdit={() => {}}
                    onDelete={() => {}} 
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {isNewModalOpen && (
        <ClientNewCommunicationModal
          open={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          cases={cases || []}
          initialCaseId={selectedCaseId || undefined}
        />
      )}
    </div>
  );
};

export default ClientCommunications;
