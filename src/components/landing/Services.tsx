
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Container } from "./Container";
import { Service, ServiceCategory } from "@/types/types";
import ServiceCategorySelector from "@/components/services/ServiceCategorySelector";
import ServicesList from "@/components/services/ServicesList";
import ServicesLoadingState from "@/components/services/ServicesLoadingState";
import ServicesErrorState from "@/components/services/ServicesErrorState";
import ServicesEmptyState from "@/components/services/ServicesEmptyState";

interface ServicesProps {
  servicesData: Service[];
  categoriesData: ServiceCategory[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export const Services: React.FC<ServicesProps> = ({
  servicesData,
  categoriesData,
  isLoading,
  hasError = false,
  onRetry,
}) => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [groupedServices, setGroupedServices] = useState<
    Record<string, Service[]>
  >({});

  useEffect(() => {
    if (!servicesData.length || !categoriesData.length) {
      setGroupedServices({});
      setFilteredServices([]);
      setActiveTab("");
      return;
    }

    // Group services by category
    const grouped: Record<string, Service[]> = {};
    categoriesData.forEach((category) => {
      grouped[category.category_id] = servicesData.filter(
        (service) => service.category?.category_id === category.category_id
      );
    });

    setGroupedServices(grouped);

    // Set initial active tab and filtered services
    const newActiveTab = activeTab || categoriesData[0]?.category_id || "";
    setActiveTab(newActiveTab);
    setFilteredServices(grouped[newActiveTab] || []);
  }, [servicesData, categoriesData, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilteredServices(groupedServices[value] || []);
  };

  return (
    <section id="services" className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a comprehensive range of business establishment and
            corporate services to help you succeed in Saudi Arabia.
          </p>
        </div>

        {isLoading ? (
          <ServicesLoadingState />
        ) : hasError ? (
          <ServicesErrorState onRetry={onRetry} />
        ) : servicesData.length === 0 ? (
          <ServicesEmptyState />
        ) : (
          <Tabs
            defaultValue={categoriesData[0]?.category_id || ""}
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <ServiceCategorySelector 
              categories={categoriesData} 
              activeCategory={activeTab}
              onCategoryChange={handleTabChange}
            />

            {activeTab && (
              <TabsContent value={activeTab} className="mt-0">
                <ServicesList services={filteredServices} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </Container>
    </section>
  );
};

export default Services;
