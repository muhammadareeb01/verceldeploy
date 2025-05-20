"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Service } from "@/types/types";

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onClick,
}) => {
  const formattedDescription = service.description
    ? service.description.length > 100
      ? `${service.description.substring(0, 100)}...`
      : service.description
    : "No description available";

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      documents: "bg-blue-100 text-blue-700",
      formation: "bg-green-100 text-green-700",
      licensing: "bg-yellow-100 text-yellow-800",
      registrations: "bg-purple-100 text-purple-700",
      essentials: "bg-pink-100 text-pink-700",
    };

    if (!service.category?.category_id) return "bg-gray-100 text-gray-700";
    return colors[service.category.category_id] || "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl shadow-sm border border-gray-100 bg-white hover:shadow-md"
      onClick={onClick}
    >
      <Card className="h-full">
        <CardHeader className="pb-1">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {service.service_name}
            </CardTitle>
            {service.category?.category_name && (
              <Badge
                className={`${getCategoryColor()} text-xs px-2 py-0.5 rounded-full`}
              >
                {service.category.category_name}
              </Badge>
            )}
          </div>
          <CardDescription className="pt-2 text-sm text-gray-500">
            {formattedDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-2 text-sm font-medium text-primary">
            {service.base_cost ? `$${service.base_cost}` : "Price upon request"}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
