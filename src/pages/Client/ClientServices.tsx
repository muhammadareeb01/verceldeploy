
// src/pages/Client/ClientServices.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useServicesQuery, useServiceCategoriesQuery } from "@/hooks/useServices";
import { useCasesQuery } from "@/hooks/useCases";
import { useCompanyByUserIdQuery } from "@/hooks/useCompanies";
import { ClientDashboardHeader } from "@/components/client-dashboard/ClientDashboardHeader";
import { ClientDashboardLoading } from "@/components/client-dashboard/ClientDashboardLoading";
import { ClientDashboardError } from "@/components/client-dashboard/ClientDashboardError";
import { Service, ServiceCategory } from "@/types/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ClipboardList, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ClientServices: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Fetch client's company
  const {
    data: clientCompany,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyByUserIdQuery(user?.id);

  // Fetch services and categories
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError,
  } = useServicesQuery();

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useServiceCategoriesQuery();

  // Pre-select mandatory services
  useEffect(() => {
    if (services.length > 0) {
      const mandatoryServiceIds = services
        .filter(service => service.is_mandatory)
        .map(service => service.service_id);
      
      setSelectedServices(mandatoryServiceIds);
    }
  }, [services]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prevSelected => {
      if (prevSelected.includes(serviceId)) {
        return prevSelected.filter(id => id !== serviceId);
      } else {
        return [...prevSelected, serviceId];
      }
    });
  };

  const handleContinue = () => {
    // Store selected services in localStorage to access in checkout page
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    navigate("/client-checkout");
  };

  const isLoading = isLoadingCompany || isLoadingServices || isLoadingCategories;
  const error = companyError || servicesError || categoriesError;

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
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Our Services</h1>
        <p className="text-muted-foreground">
          Select the services you need for your business. Mandatory services are pre-selected.
        </p>
      </div>
      
      {categories.map((category) => {
        // Filter services for this category
        const categoryServices = services.filter(
          (service) => service.category?.category_id === category.category_id
        );
        
        if (categoryServices.length === 0) return null;
        
        return (
          <div key={category.category_id} className="mb-8">
            <h2 className="text-2xl font-medium mb-4">{category.category_name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryServices.map((service) => {
                const isSelected = selectedServices.includes(service.service_id);
                const isMandatory = service.is_mandatory;
                
                return (
                  <Card 
                    key={service.service_id} 
                    className={`border-2 ${isSelected ? 'border-primary' : 'border-gray-200'}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{service.service_name}</CardTitle>
                        {isMandatory && (
                          <Badge variant="outline">Required</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {service.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {service.estimated_duration_days 
                            ? `${service.estimated_duration_days} days` 
                            : 'Duration varies'}
                        </span>
                      </div>
                      {service.base_cost && (
                        <div className="text-lg font-bold">
                          ${service.base_cost}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={isSelected ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => !isMandatory && toggleServiceSelection(service.service_id)}
                        disabled={isMandatory}
                      >
                        {isSelected && <Check className="h-4 w-4 mr-2" />}
                        {isSelected ? 'Selected' : 'Select'} 
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      
      <div className="flex justify-end mt-6">
        <Button 
          disabled={selectedServices.length === 0}
          onClick={handleContinue}
          size="lg"
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
};

export default ClientServices;
