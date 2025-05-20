import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ApiTask } from "@/types/tasks";

interface TaskCategoryListItem { category_id: string; category_name: string; }
interface DocumentTypeListItem { doc_type_id: string; doc_type_name: string; }
interface CompanyListItem { company_id: string; name: string; }

interface CompanyTaskFormProps {
  task: ApiTask;
  formData: Partial<ApiTask>;
  handleInputChange: (field: keyof ApiTask, value: any) => void;
  handleNumericInputChange: (field: keyof ApiTask, value: string) => void;
  isEditMode: boolean;
  taskCategoriesList: TaskCategoryListItem[];
  documentTypesList: DocumentTypeListItem[];
  companies: CompanyListItem[];
}

const CompanyTaskForm: React.FC<CompanyTaskFormProps> = ({
  task,
  formData,
  handleInputChange,
  handleNumericInputChange,
  isEditMode,
  taskCategoriesList,
  documentTypesList,
  companies,
}) => {
  const renderField = (
    label: string,
    fieldKey: keyof ApiTask,
    type: "text" | "textarea" | "number" | "select" = "text",
    options?: { value: string; label: string }[]
  ) => {
    let displayValue: string | number | null = "N/A";
    if (task[fieldKey] !== undefined && task[fieldKey] !== null) {
      if (type === "select" && options && options.length > 0) {
        const selectedOption = options.find(opt => opt.value === task[fieldKey]);
        displayValue = selectedOption ? selectedOption.label : (task[fieldKey] as string);
      } else {
        displayValue = (task[fieldKey] as string | number).toString();
      }
    }
    if (displayValue === '' && !isEditMode) displayValue = "N/A";

    return (
      <div className="space-y-1">
        <Label htmlFor={String(fieldKey)} className="text-sm font-medium">
          {label}
        </Label>
        {isEditMode ? (
          type === "textarea" ? (
            <Textarea 
              id={String(fieldKey)} 
              value={(formData[fieldKey] as string) || ""} 
              onChange={(e) => handleInputChange(fieldKey, e.target.value)} 
              className="min-h-[80px] rounded-md" 
              placeholder={`Enter ${label.toLowerCase()}`} 
            />
          ) : type === "number" ? (
            <Input 
              id={String(fieldKey)} 
              type="number" 
              value={(formData[fieldKey] as number | null)?.toString() || ""} 
              onChange={(e) => handleNumericInputChange(fieldKey, e.target.value)} 
              placeholder={`Enter ${label.toLowerCase()}`} 
              className="rounded-md" 
            />
          ) : type === "select" && options && options.length > 0 ? (
            <Select 
              value={(formData[fieldKey] as string) || ""} 
              onValueChange={(value) => handleInputChange(fieldKey, value === "null" ? null : value)}
            >
              <SelectTrigger className="rounded-md">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">N/A (Clear Selection)</SelectItem>
                {options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input 
              id={String(fieldKey)} 
              type="text" 
              value={(formData[fieldKey] as string) || ""} 
              onChange={(e) => handleInputChange(fieldKey, e.target.value)} 
              placeholder={`Enter ${label.toLowerCase()}`} 
              className="rounded-md" 
            />
          )
        ) : (
          <p className="text-sm text-muted-foreground pt-1 break-words">
            {displayValue}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {renderField("Task Name", "task_name", "text")}
      {renderField("Description", "description", "textarea")}
      {renderField("Priority", "priority", "number")}
      {renderField("Task Category", "task_category_id", "select", taskCategoriesList.map(tc => ({ value: tc.category_id, label: tc.category_name })))}
      {renderField("Document Type", "document_type_id", "select", documentTypesList.map(dt => ({ value: dt.doc_type_id, label: dt.doc_type_name })))}
      {renderField("Company", "company_id", "select", companies.map(c => ({ value: c.company_id, label: c.name })))}
    </div>
  );
};

export default CompanyTaskForm;