
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, Mail, Phone, User, MapPin, Calendar,
  FileText, Users, Briefcase
} from "lucide-react";
import { Company } from "@/types/types";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  company: Company;
  casesCount?: number;
  documentsCount?: number;
  onClick?: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  casesCount = 0,
  documentsCount = 0,
  onClick
}) => {
  // Format creation date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get industry color based on industry name
  const getIndustryColor = () => {
    if (!company.industry) return "bg-gray-100 text-gray-800 border-gray-200";
    
    // Simple hash function to generate consistent colors
    const hash = company.industry.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const industries: Record<string, string> = {
      "Technology": "bg-blue-100 text-blue-800 border-blue-200",
      "Finance": "bg-green-100 text-green-800 border-green-200",
      "Healthcare": "bg-purple-100 text-purple-800 border-purple-200",
      "Manufacturing": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Retail": "bg-pink-100 text-pink-800 border-pink-200",
      "Education": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Food": "bg-orange-100 text-orange-800 border-orange-200",
      "Construction": "bg-amber-100 text-amber-800 border-amber-200",
      "Consulting": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Transportation": "bg-lime-100 text-lime-800 border-lime-200",
    };
    
    // Try to match with predefined industries or generate consistent color
    return industries[company.industry] || `bg-opacity-20 border-opacity-30 text-opacity-90`;
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-gradient-to-r from-violet-100 to-blue-100 h-2"></div>
      <CardContent className="pt-5">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{company.name}</h3>
            {company.industry && (
              <Badge variant="outline" className={cn("text-xs mt-1", getIndustryColor())}>
                {company.industry}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            {casesCount > 0 && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <Briefcase className="h-3 w-3" />
                {casesCount}
              </Badge>
            )}
            {documentsCount > 0 && (
              <Badge variant="outline" className="flex gap-1 items-center">
                <FileText className="h-3 w-3" />
                {documentsCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm mt-4">
          {company.primary_contact_name && (
            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">{company.primary_contact_name}</span>
            </div>
          )}
          
          {company.primary_contact_email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">{company.primary_contact_email}</span>
            </div>
          )}
          
          {company.primary_contact_phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span>{company.primary_contact_phone}</span>
            </div>
          )}

          {company.country_of_origin && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{company.country_of_origin}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3 bg-slate-50 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Created: {formatDate(company.created_at)}
        </div>
        
        {company.account_manager_id && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1" />
            Has Manager
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;
