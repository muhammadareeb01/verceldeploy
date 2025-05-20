import React, { useState, useEffect } from "react";
import { getServiceCategories, getServices } from "@/api/services";
import { Service, ServiceCategory } from "@/types/types";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Services } from "@/components/landing/Services";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";
import { Reviews } from "@/components/landing/Reviews";
import { toast } from "sonner";

const Landing: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        console.log("Starting to fetch data for Landing page...");

        // Use Promise.all to fetch both services and categories in parallel
        const [servicesData, categoriesData] = await Promise.all([
          getServices(),
          getServiceCategories(),
        ]);

        console.log("Fetched services:", servicesData?.length || 0);
        console.log("Fetched services:", servicesData);
        console.log("Fetched categories:", categoriesData?.length || 0);

        if (
          servicesData &&
          servicesData.length > 0 &&
          categoriesData &&
          categoriesData.length > 0
        ) {
          setServices(servicesData);
          setCategories(categoriesData);
        } else {
          // If data is missing, try again once more after a short delay
          console.log("Data missing or empty, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const [retryServices, retryCategories] = await Promise.all([
            getServices(),
            getServiceCategories(),
          ]);

          setServices(retryServices || []);
          setCategories(retryCategories || []);

          if (
            !retryServices ||
            retryServices.length === 0 ||
            !retryCategories ||
            retryCategories.length === 0
          ) {
            console.warn("Still missing data after retry");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasError(true);
        toast.error("Failed to load services", {
          description: "Please try refreshing the page",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    // Re-fetch data by triggering the effect again
    setServices([]);
    setCategories([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <Hero />
      <About />
      <Services
        servicesData={services}
        categoriesData={categories}
        isLoading={isLoading}
        hasError={hasError}
        onRetry={handleRetry}
      />
      <Reviews />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Landing;
