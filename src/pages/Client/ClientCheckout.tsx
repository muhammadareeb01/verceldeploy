
// src/pages/Client/ClientCheckout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useServicesQuery } from "@/hooks/useServices";
import { useCreateCaseMutation } from "@/hooks/useCases";
import { useCompanyByUserIdQuery } from "@/hooks/useCompanies";
import { ClientDashboardHeader } from "@/components/client-dashboard/ClientDashboardHeader";
import { ClientDashboardLoading } from "@/components/client-dashboard/ClientDashboardLoading";
import { ClientDashboardError } from "@/components/client-dashboard/ClientDashboardError";
import { Service } from "@/types/types";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";

const ClientCheckout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch client's company
  const {
    data: clientCompany,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyByUserIdQuery(user?.id);

  // Fetch all services
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError,
  } = useServicesQuery();

  const createCaseMutation = useCreateCaseMutation();

  // Load selected services from localStorage
  useEffect(() => {
    const savedServices = localStorage.getItem('selectedServices');
    if (savedServices) {
      const parsedServiceIds = JSON.parse(savedServices) as string[];
      setSelectedServiceIds(parsedServiceIds);
    } else {
      // Redirect back to services page if no services are selected
      navigate("/client-services");
    }
  }, [navigate]);

  // Filter services to get only selected ones
  useEffect(() => {
    if (services.length > 0 && selectedServiceIds.length > 0) {
      const filteredServices = services.filter(service => 
        selectedServiceIds.includes(service.service_id)
      );
      setSelectedServices(filteredServices);
    }
  }, [services, selectedServiceIds]);

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.base_cost || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!clientCompany) {
      toast.error("No company found for user");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a case for each selected service
      const promises = selectedServices.map(service => {
        return createCaseMutation.mutateAsync({
          company_id: clientCompany.company_id,
          service_id: service.service_id,
          case_status: "NOT_STARTED",
        });
      });

      await Promise.all(promises);
      // Clear the localStorage after successful submission
      localStorage.removeItem('selectedServices');
      toast.success("Services requested successfully!");
      navigate("/client-cases");
    } catch (error: any) {
      toast.error("Failed to request services: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingCompany || isLoadingServices;
  const error = companyError || servicesError;

  if (isLoading) {
    return <ClientDashboardLoading />;
  }

  if (error) {
    return (
      <ClientDashboardError
        message="Failed to load services data"
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ClientDashboardHeader clientCompany={clientCompany} />
      
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/client-services")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Services
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Summary - Left/Top */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Selected Services</CardTitle>
              <CardDescription>
                You have selected {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedServices.map((service) => (
                    <TableRow key={service.service_id}>
                      <TableCell className="font-medium">
                        {service.service_name}
                        {service.is_mandatory && (
                          <Badge variant="outline" className="ml-2">Required</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {service.estimated_duration_days 
                          ? `${service.estimated_duration_days} days` 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${service.base_cost || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary - Right/Bottom */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Services"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientCheckout;
