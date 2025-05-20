
// src/components/companies/CompanyHeader.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface CompanyHeaderProps {
  title: string;
  description: string;
  instructions?: string[];
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  title,
  description,
  instructions = [],
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {instructions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-md p-4 text-sm flex gap-2 items-start">
          <Info className="h-4 w-4 mt-0.5" />
          <div>
            <p className="font-medium">Instructions:</p>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyHeader;
