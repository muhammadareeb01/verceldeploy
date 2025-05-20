
// src/components/services/ServiceCategorySelector.tsx
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategory } from "@/types/types";

interface ServiceCategorySelectorProps {
  categories: ServiceCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const ServiceCategorySelector: React.FC<ServiceCategorySelectorProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  if (categories.length === 0) return null;
  
  return (
    <div className="flex justify-center mb-8 overflow-x-auto scrollbar-hide">
      <TabsList className="bg-gray-100 rounded-xl px-2 py-1 shadow-inner gap-2">
        {categories.map((category) => (
          <TabsTrigger
            key={category.category_id}
            value={category.category_id}
            className="px-4 py-2 text-sm rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
            onClick={() => onCategoryChange(category.category_id)}
          >
            {category.category_name}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default ServiceCategorySelector;
