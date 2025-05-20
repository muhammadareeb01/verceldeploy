import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form"; // Import Controller for Select
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Optional: for more context
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // For description
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// TaskCategoryRow should be defined (e.g. in types/tasks.ts or locally in Tasks.tsx and passed)
// For now, assuming it's { category_id: string, category_name: string }
import { UserRole } from "@/types/types";
import { PredefinedTask, CaseTask, CompanyTask } from "@/types/tasks"; // Import base types

// Data shape that the form dialog submits via its onSubmit prop.
// It contains only the fields relevant to the specific task definition type,
// EXCLUDING formType, as that's handled by the parent.
export type TaskDefinitionFormData =
  | Omit<PredefinedTask, 'predefined_task_id'>
  | Omit<CaseTask, 'case_task_id'>
  | Omit<CompanyTask, 'company_task_id'>;

// Props for the data dropdowns
interface Service { service_id: string; service_name: string; }
interface DocumentType { doc_type_id: string; doc_type_name: string; }
interface Company { company_id: string; name: string; }
interface CaseDataType { case_id: string; company_id: string; notes?: string | null; }
interface TaskCategoryRow { category_id: string; category_name: string; }

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit"; // Edit mode might need initialData of the specific definition type
  formType: "predefined" | "case" | "company";
  services: Service[];
  categories: TaskCategoryRow[];
  documentTypes: DocumentType[];
  clients: Company[]; // Renamed from companies in Tasks.tsx props to clients here
  cases: CaseDataType[];
  usersForAssignment?: UserDetail[]; // Added from Tasks.tsx, if needed for default_responsible_role
  userRole: UserRole; // Or specific roles if that's what default_responsible_role expects
  initialData?: Partial<TaskDefinitionFormData>; // For edit mode
  onSubmit: (data: TaskDefinitionFormData) => void; // Submits data WITHOUT formType
  isMutating: boolean;
  isLoading?: boolean; // isLoading might be for fetching data for edit, isMutating for submit
  mutationError: Error | null;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  formType,
  services,
  categories,
  documentTypes,
  clients,
  cases,
  usersForAssignment, // Added
  userRole,
  initialData = {},
  onSubmit,
  isMutating,
  isLoading,
  mutationError,
}) => {
  // The form's type should be a union of possible fields, or use `any` and build specific object.
  // Using `any` here for simplicity with RHF, specific fields shown/hidden by formType.
  const form = useForm<any>({ // Using 'any' for flexibility with dynamic fields
    defaultValues: {
      task_name: initialData?.task_name || "",
      description: initialData?.description || "",
      priority: (initialData as any)?.priority || 1, // Cast if initialData is partial
      task_category_id: (initialData as any)?.task_category_id || "",
      document_type_id: (initialData as any)?.document_type_id || "",
      // Predefined specific
      service_id: (initialData as Omit<PredefinedTask, 'predefined_task_id'>)?.service_id || "",
      default_responsible_role: (initialData as Omit<PredefinedTask, 'predefined_task_id'>)?.default_responsible_role || "",
      typical_duration_days: (initialData as Omit<PredefinedTask, 'predefined_task_id'>)?.typical_duration_days || 0,
      // Case specific
      case_id: (initialData as Omit<CaseTask, 'case_task_id'>)?.case_id || "",
      // Company specific
      company_id: (initialData as Omit<CompanyTask, 'company_task_id'>)?.company_id || "",
      // is_active is not in PredefinedTask, CaseTask, or CompanyTask from types/tasks.ts
    },
  });

  useEffect(() => {
    form.reset({ // Reset form when initialData or formType changes for edit mode
      task_name: initialData?.task_name || "",
      description: initialData?.description || "",
      priority: (initialData as any)?.priority || 1,
      task_category_id: (initialData as any)?.task_category_id || "",
      document_type_id: (initialData as any)?.document_type_id || "",
      service_id: formType === 'predefined' ? (initialData as Omit<PredefinedTask, 'predefined_task_id'>)?.service_id || "" : "",
      default_responsible_role: formType === 'predefined' ? (initialData as Omit<PredefinedTask, 'predefined_task_id'>)?.default_responsible_role || "" : "",
      typical_duration_days: formType === 'predefined' ? (initialData as Omit<PredefinedTask, 'predefined_task_id'>)?.typical_duration_days || 0 : 0,
      case_id: formType === 'case' ? (initialData as Omit<CaseTask, 'case_task_id'>)?.case_id || "" : "",
      company_id: formType === 'company' ? (initialData as Omit<CompanyTask, 'company_task_id'>)?.company_id || "" : "",
    });
  }, [formType, initialData, form.reset]);


  const handleFormSubmit = (data: any) => { // RHF provides all touched fields
    let relevantData: TaskDefinitionFormData;

    const commonData = {
        task_name: data.task_name,
        description: data.description || "", // Ensure string, as per types
        priority: Number(data.priority),
        task_category_id: data.task_category_id,
        document_type_id: data.document_type_id,
    };

    switch (formType) {
      case "predefined":
        relevantData = {
          ...commonData,
          service_id: data.service_id,
          default_responsible_role: data.default_responsible_role || userRole.toString(), // Example default
          typical_duration_days: Number(data.typical_duration_days) || 0,
        };
        break;
      case "case":
        relevantData = {
          ...commonData,
          case_id: data.case_id,
        };
        break;
      case "company":
        relevantData = {
          ...commonData,
          company_id: data.company_id,
        };
        break;
      default:
        console.error("Invalid form type in TaskFormDialog");
        toast.error("Invalid form type.");
        return;
    }
    onSubmit(relevantData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? `Create New ${formType.charAt(0).toUpperCase() + formType.slice(1)} Task Definition` : `Edit Task Definition`}
          </DialogTitle>
          {mode === "create" && <DialogDescription>Fill in the details for the new task definition.</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="task_name"
              rules={{ required: "Task name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl><Input {...field} placeholder="Enter task name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Enter task description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              rules={{ required: "Priority is required", min: {value: 1, message: "Min 1"}, max: {value: 5, message: "Max 5"} }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority (1-5)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || 1)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((p) => (<SelectItem key={p} value={String(p)}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="task_category_id"
              rules={{ required: "Task category is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map((cat) => (<SelectItem key={cat.category_id} value={cat.category_id}>{cat.category_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_type_id"
              rules={{ required: "Document type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a document type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {documentTypes.map((doc) => (<SelectItem key={doc.doc_type_id} value={doc.doc_type_id}>{doc.doc_type_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Predefined Task Fields */}
            {formType === "predefined" && (
              <>
                <FormField
                  control={form.control}
                  name="service_id"
                  rules={{ required: "Service is required for predefined tasks" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {services.map((s) => (<SelectItem key={s.service_id} value={s.service_id}>{s.service_name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="default_responsible_role"
                  rules={{ required: "Default responsible role is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Responsible Role</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {/* Assuming UserRole is an enum imported from types/types */}
                            {Object.values(UserRole).map(roleValue => (
                                <SelectItem key={roleValue} value={roleValue}>{roleValue}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="typical_duration_days"
                  rules={{ required: "Typical duration is required", min: 0 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typical Duration (Days)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Case Task Fields */}
            {formType === "case" && (
              <FormField
                control={form.control}
                name="case_id"
                rules={{ required: "Case is required for case tasks" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a case" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {cases.map((c) => (<SelectItem key={c.case_id} value={c.case_id}>Case ID: {c.case_id}{c.notes ? ` (${c.notes.substring(0,30)}...)` : ''}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Company Task Fields */}
            {formType === "company" && (
              <FormField
                control={form.control}
                name="company_id"
                rules={{ required: "Client/Company is required for company tasks" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client/Company</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a client/company" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clients.map((c) => (<SelectItem key={c.company_id} value={c.company_id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating || isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating || isLoading}>
                {isLoading || isMutating ? "Saving..." : (mode === "create" ? "Create Definition" : "Save Changes")}
              </Button>
            </DialogFooter>
            {mutationError && (
              <p className="text-sm text-destructive pt-2">{mutationError.message}</p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;