
// src/components/services/ServicesList.tsx
import React from "react";
import { motion } from "framer-motion";
import ServiceCard from "@/components/landing/ServiceCard";
import { Service } from "@/types/types";

interface ServicesListProps {
  services: Service[];
}

const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {services.map((service) => (
        <ServiceCard key={service.service_id} service={service} />
      ))}
    </motion.div>
  );
};

export default ServicesList;
