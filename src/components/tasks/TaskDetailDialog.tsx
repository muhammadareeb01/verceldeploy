// src/components/tasks/TaskDetailDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Clock,
  User,
  Edit,
  Trash2,
  FileText,
  Save,
  Info,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ApiTask, TaskOriginType } from "@/types/tasks";
import { formatDate } from "@/utils/formatters";
import PredefinedTaskForm from "./Pre_defined_task";
import CaseTaskForm from "./case_task_form";
import CompanyTaskForm from "./commpany_task_form";

interface ServiceListItem { service_id: string; service_name: string; }
interface CaseListItem { case_id: string; case_title?: string; }
interface TaskCategoryListItem { category_id: string; category_name: string; }
interface DocumentTypeListItem { doc_type_id: string; doc_type_name: string; }
interface UserRoleListItem { value: string; label: string; }
interface CompanyListItem { company_id: string; name: string; }

interface TaskDetailDialogProps {
  task: ApiTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  onEdit?: () => void;
  onDelete?: (task: ApiTask) => void;
  onUpdate?: (updatedTask: Partial<ApiTask>) => void;
  relatedDocuments?: {
    id: string;
    name: string;
    type: string;
    createdAt: string;
  }[];
  servicesList?: ServiceListItem[];
  casesList?: CaseListItem[];
  taskCategoriesList?: TaskCategoryListItem[];
  documentTypesList?: DocumentTypeListItem[];
  userRolesList?: UserRoleListItem[];
  companies?: CompanyListItem[];
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  open,
  onOpenChange,
  isEditMode,
  onEdit,
  onDelete,
  onUpdate,
  relatedDocuments = [],
  servicesList = [],
  casesList = [],
  taskCategoriesList = [],
  documentTypesList = [],
  userRolesList = [],
  companies = [],
}) => {
  const [formData, setFormData] = useState<Partial<ApiTask>>({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    console.log("Task received in TaskDetailDialog:", task);
    if (task) {
      // Exclude task instance fields and timestamps
      const { status, assigned_to, start_date, due_date, completed_at, actual_duration_days, active, notes, created_at, updated_at, ...editableFields } = task;
      console.log("Editable fields extracted:", editableFields);
      setFormData(editableFields);
    } else {
      setFormData({});
    }
  }, [task, isEditMode]);

  if (!task) return null;

  const findLabelById = (id: string | undefined | null, list: any[], idField: string, nameField: string): string | null => {
    if (!id || !list || list.length === 0) return null;
    const item = list.find(i => i[idField] === id);
    return item ? item[nameField] : null;
  };

  const caseTitle = findLabelById((task as CaseTask).case_id, casesList, 'case_id', 'case_title') || 
                    ((task as CaseTask).case_id ? `Case ${(task as CaseTask).case_id.substring(0, 8)}` : 'No case assigned');

  const handleInputChange = (field: keyof ApiTask, value: any) => {
    console.log(`Input changed for field ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericInputChange = (field: keyof ApiTask, value: string) => {
    const num = value === "" ? null : Number(value);
    if (value === "" || (num !== null && !isNaN(num))) {
      console.log(`Numeric input changed for field ${field}:`, num);
      setFormData((prev) => ({ ...prev, [field]: num }));
    }
  };

  const handleSave = () => {
    console.log("Saving form data:", formData);
    if (onUpdate) {
      onUpdate(formData);
    }
  };

  const handleDeleteClick = () => {
    console.log("Delete button clicked for task:", task);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    console.log("Confirming delete for task:", task);
    if (onDelete && task) {
      onDelete(task);
      setShowDeleteConfirmation(false);
      onOpenChange(false);
    }
  };

  const cancelDelete = () => {
    console.log("Canceling delete");
    setShowDeleteConfirmation(false);
  };

  const getTaskFormType = (task: ApiTask): "predefined" | "case" | "company" => {
    if ("predefined_task_id" in task && task.predefined_task_id) {
      return "predefined";
    } else if ("case_task_id" in task && task.case_task_id) {
      return "case";
    } else if ("company_task_id" in task && task.company_task_id) {
      return "company";
    }
    console.warn("Unknown task type, defaulting to predefined:", task);
    return "predefined"; // Fallback, though this should rarely happen
  };

  const renderTaskForm = () => {
    const formType = getTaskFormType(task);
    console.log("Rendering form for task type:", formType);
    const formProps = {
      task,
      formData,
      handleInputChange,
      handleNumericInputChange,
      isEditMode,
      servicesList,
      casesList,
      taskCategoriesList,
      documentTypesList,
      userRolesList,
      companies,
    };

    switch (formType) {
      case "predefined":
        return <PredefinedTaskForm {...formProps} />;
      case "case":
        return <CaseTaskForm {...formProps} />;
      case "company":
        return <CompanyTaskForm {...formProps} />;
      default:
        console.warn("Unknown form type:", formType);
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex justify-between items-center">
            {isEditMode ? (
              <Input 
                value={formData.task_name || ""} 
                onChange={(e) => handleInputChange("task_name", e.target.value)} 
                className="text-2xl font-bold flex-grow mr-2 h-auto p-1 border-0 shadow-none focus-visible:ring-0" 
                placeholder="Task Name"
              />
            ) : (
              <div className="text-2xl font-bold truncate pr-2">{task.task_name}</div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 px-6 overflow-y-auto flex-grow">
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              {task.priority && (
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-500">Priority: {task.priority}</span>
                </div>
              )}
              {(task as PredefinedTask).default_responsible_user_role && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">
                    Default Role: <span className="font-medium">{(task as PredefinedTask).default_responsible_user_role}</span>
                  </span>
                </div>
              )}
              {(task as CaseTask).case_id && (
                <div className="flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">
                    Case: <span className="font-medium">{caseTitle}</span>
                  </span>
                </div>
              )}
              {(task as CompanyTask).company_id && (
                <div className="flex items-center">
                  <Info className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">
                    Company: <span className="font-medium">
                      {findLabelById((task as CompanyTask).company_id, companies, 'company_id', 'name') || 'No company assigned'}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className={`space-y-4 ${!isEditMode ? 'border-t pt-6 mt-6' : ''}`}>
            {renderTaskForm()}
          </div>

          {relatedDocuments.length > 0 && (
            <div className="animate-fade-in mt-6 pt-6 border-t">
              <h3 className="text-base font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />Related Documents
              </h3>
              <div className="space-y-2">
                {relatedDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {formatDate(doc.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t mt-auto">
          <div className="flex justify-end gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)} 
                  className="gap-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4" />Save Changes
                </Button>
              </>
            ) : (
              <>
                {onEdit && (
                  <Button 
                    variant="outline" 
                    onClick={onEdit} 
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" />Edit
                  </Button>
                )}
                {onDelete && (
                  <>
                    {showDeleteConfirmation ? (
                      <>
                        <Button 
                          variant="destructive" 
                          onClick={confirmDelete} 
                          className="gap-1"
                        >
                          <Trash2 className="h-4 w-4" />Confirm Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelDelete} 
                          className="gap-1"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteClick} 
                        className="gap-1"
                      >
                        <Trash2 className="h-4 w-4" />Delete
                      </Button>
                    )}
                  </>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;