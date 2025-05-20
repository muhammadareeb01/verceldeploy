
// src/components/services/ServicesLoadingState.tsx
import React from "react";
import { Loader2 } from "lucide-react";

const ServicesLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-gray-600">Loading services...</p>
    </div>
  );
};

export default ServicesLoadingState;
