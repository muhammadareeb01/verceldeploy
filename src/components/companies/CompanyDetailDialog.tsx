
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Edit, Trash2, Building, Mail, Phone, User, MapPin,
  FileText, Users, Briefcase, ClipboardCheck, FileDigit, Building2
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { Company } from "@/types/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CompanyDetailDialogProps {
  company: Company | null;
  relatedCasesCount?: number;
  relatedDocumentsCount?: number;
  accountManager?: {
    name: string;
    role: string;
    avatarUrl?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewCases?: () => void;
  onViewDocuments?: () => void;
}

const CompanyDetailDialog: React.FC<CompanyDetailDialogProps> = ({
  company,
  relatedCasesCount = 0,
  relatedDocumentsCount = 0,
  accountManager = null,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onViewCases,
  onViewDocuments,
}) => {
  if (!company) return null;

  // Get the initials of a person's name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold">{company.name}</DialogTitle>
            {company.industry && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                {company.industry}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* Main Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <CardContent className="pt-4">
                <h3 className="text-base font-semibold mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Company Information
                </h3>
                <div className="space-y-3">
                  {company.legal_structure && (
                    <div className="flex items-center text-sm">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Legal Structure:</span>
                      <span className="font-medium">{company.legal_structure}</span>
                    </div>
                  )}
                  
                  {company.country_of_origin && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Country of Origin:</span>
                      <span className="font-medium">{company.country_of_origin}</span>
                    </div>
                  )}
                  
                  {company.registration_number && (
                    <div className="flex items-center text-sm">
                      <FileDigit className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Registration Number:</span>
                      <span className="font-medium">{company.registration_number}</span>
                    </div>
                  )}
                  
                  {company.tax_id && (
                    <div className="flex items-center text-sm">
                      <ClipboardCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Tax ID:</span>
                      <span className="font-medium">{company.tax_id}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Created:</span>
                    <span className="font-medium">
                      {company.created_at ? formatDate(company.created_at) : "Unknown"}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Updated:</span>
                    <span className="font-medium">
                      {company.updated_at ? formatDate(company.updated_at) : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <CardContent className="pt-4">
                <h3 className="text-base font-semibold mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {company.primary_contact_name && (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Primary Contact:</span>
                      <span className="font-medium">{company.primary_contact_name}</span>
                    </div>
                  )}
                  
                  {company.primary_contact_email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Email:</span>
                      <a href={`mailto:${company.primary_contact_email}`} className="font-medium text-blue-600 hover:underline">
                        {company.primary_contact_email}
                      </a>
                    </div>
                  )}
                  
                  {company.primary_contact_phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Phone:</span>
                      <a href={`tel:${company.primary_contact_phone}`} className="font-medium hover:underline">
                        {company.primary_contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Manager */}
          {accountManager && (
            <div className="animate-fade-in">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Account Manager
              </h3>
              <div className="p-4 border rounded-md flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={accountManager.avatarUrl} alt={accountManager.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(accountManager.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{accountManager.name}</p>
                  <p className="text-sm text-muted-foreground">{accountManager.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Associated Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cases */}
            <Card 
              className={cn(
                "overflow-hidden transition-colors", 
                relatedCasesCount > 0 ? "hover:bg-muted/80 cursor-pointer" : ""
              )}
              onClick={relatedCasesCount > 0 ? onViewCases : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-medium">Cases</h3>
                  </div>
                  <Badge>{relatedCasesCount}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {relatedCasesCount > 0 
                    ? `This company has ${relatedCasesCount} associated case${relatedCasesCount !== 1 ? 's' : ''}.`
                    : "No cases associated with this company."
                  }
                </p>
              </CardContent>
              {relatedCasesCount > 0 && (
                <CardFooter className="pt-0 pb-3">
                  <Button variant="ghost" size="sm">View Cases</Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Documents */}
            <Card 
              className={cn(
                "overflow-hidden transition-colors", 
                relatedDocumentsCount > 0 ? "hover:bg-muted/80 cursor-pointer" : ""
              )}
              onClick={relatedDocumentsCount > 0 ? onViewDocuments : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-medium">Documents</h3>
                  </div>
                  <Badge>{relatedDocumentsCount}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {relatedDocumentsCount > 0 
                    ? `This company has ${relatedDocumentsCount} associated document${relatedDocumentsCount !== 1 ? 's' : ''}.`
                    : "No documents associated with this company."
                  }
                </p>
              </CardContent>
              {relatedDocumentsCount > 0 && (
                <CardFooter className="pt-0 pb-3">
                  <Button variant="ghost" size="sm">View Documents</Button>
                </CardFooter>
              )}
            </Card>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {onEdit && (
              <Button variant="outline" className="gap-1" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" className="gap-1" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailDialog;
