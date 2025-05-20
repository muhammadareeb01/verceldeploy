import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { TaskAssignmentForm, AssignTaskFormData, Profile as FormProfile } from "@/components/tasks/formAssigned";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiTask, TaskOriginType } from "@/types/tasks";

// Re-define Profile type
export type Profile = FormProfile;

// Interface for task instances
interface TaskInstance {
  task_instance_id: string;
  task_name: string;
  status: string;
  assigned_to: string | null;
  start_date: string | null;
  due_date: string | null;
  priority: number;
  created_at: string;
  description?: string;
  completed_at?: string | null;
  actual_duration_days?: number | null;
}

// Reusable ConfirmationModal component
interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl max-w-md w-[90vw] sm:w-full border border-gray-300 z-50">
          <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">{title}</Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">{message}</Dialog.Description>
          <div className="flex justify-end space-x-3">
            <Dialog.Close asChild>
              <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100">
                {cancelText}
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Reusable ActionButtons component
const ActionButtons: React.FC<{
  taskInstanceId: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ taskInstanceId, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        title="Edit Task Instance"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 hover:bg-red-50"
        title="Delete Task Instance"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Helper to transform raw Supabase data to ApiTask
const transformDbRecordToApiTask = (dbRecord: any, originType: TaskOriginType): ApiTask | null => {
  if (!dbRecord) return null;
  const specificId = dbRecord.task_id || dbRecord.predefined_task_id || dbRecord.case_task_id || dbRecord.company_task_id;
  if (!specificId) {
    console.warn(`TaskAssignmentPage: specificId for ${originType} missing. Record:`, dbRecord);
    return null;
  }
  const commonFields = {
    task_name: dbRecord.task_name || "",
    description: dbRecord.description || "",
    priority: typeof dbRecord.priority === "number" ? dbRecord.priority : 0,
    task_category_id: dbRecord.task_category_id || undefined,
    document_type_id: dbRecord.document_type_id || undefined,
    created_at: dbRecord.created_at,
    updated_at: dbRecord.updated_at,
  };
  switch (originType) {
    case TaskOriginType.PREDEFINED:
      return {
        ...commonFields,
        predefined_task_id: specificId,
        task_id: specificId,
        origin_type: TaskOriginType.PREDEFINED,
        service_id: dbRecord.service_id,
        default_responsible_user_role: dbRecord.default_responsible_role || dbRecord.default_responsible_user_role,
        typical_duration_days: dbRecord.typical_duration_days,
      };
    case TaskOriginType.CASE:
      return {
        ...commonFields,
        case_task_id: specificId,
        task_id: specificId,
        origin_type: TaskOriginType.CASE,
        case_id: dbRecord.case_id,
      };
    case TaskOriginType.COMPANY:
      return {
        ...commonFields,
        company_task_id: specificId,
        task_id: specificId,
        origin_type: TaskOriginType.COMPANY,
        company_id: dbRecord.company_id,
      };
    default:
      console.warn("TaskAssignmentPage: Unknown originType in transformDbRecordToApiTask", originType);
      return null;
  }
};

const TaskAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(search);
  const typeform = queryParams.get("typeform") as "predefined" | "case" | "company" | null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskInstanceId, setEditingTaskInstanceId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskInstanceToDelete, setTaskInstanceToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<AssignTaskFormData>({
    origin_task_type: typeform || "predefined",
    origin_task_id: id || "",
    status: "NOT_STARTED",
    assigned_to: null,
    start_date: null,
    due_date: null,
    completed_at: null,
    description: "",
    priority: 0,
    actual_duration_days: null,
  });

  // Validate typeform and id early
  if (!id || !typeform || !["predefined", "case", "company"].includes(typeform)) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Invalid Task Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The task ID or type is missing or invalid. Please check the URL or go back and try again.
            </p>
            <Button onClick={() => navigate('/tasks')} variant="outline" className="mt-4">Go to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let tableName: string, idColumn: string, originTypeEnum: TaskOriginType;
  switch (typeform) {
    case "predefined":
      tableName = "predefined_tasks"; idColumn = "predefined_task_id"; originTypeEnum = TaskOriginType.PREDEFINED; break;
    case "case":
      tableName = "case_tasks"; idColumn = "case_task_id"; originTypeEnum = TaskOriginType.CASE; break;
    case "company":
      tableName = "company_tasks"; idColumn = "company_task_id"; originTypeEnum = TaskOriginType.COMPANY; break;
    default:
      console.error("Invalid typeform:", typeform);
      return <div className="text-red-500 p-4">Error: Invalid task type specified.</div>;
  }

  const { data: task, isLoading: taskLoading, error: taskError } = useQuery({
    queryKey: ["task", id, typeform],
    queryFn: async () => {
      const { data, error } = await supabase.from(tableName).select("*").eq(idColumn, id!).single();
      if (error) throw error;
      if (!data) throw new Error(`Task not found with ID ${id} in ${tableName}.`);
      return transformDbRecordToApiTask(data, originTypeEnum);
    },
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: taskInstances, isLoading: taskInstancesLoading, error: taskInstancesError } = useQuery<TaskInstance[]>({
    queryKey: ['taskInstances', id, typeform.toUpperCase()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_instances')
        .select('*')
        .eq('origin_task_id', id)
        .eq('origin_task_type', typeform.toUpperCase())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!typeform,
  });

  const displayTaskInstances = useMemo(() => {
    if (!taskInstances || !profiles) return [];
    return taskInstances.map(instance => ({
      ...instance,
      assigned_to_name: profiles.find(p => p.id === instance.assigned_to)?.full_name || <span className="italic text-gray-500">N/A</span>,
    }));
  }, [taskInstances, profiles]);

  const createTaskMutation = useMutation({
    mutationFn: async (newTaskInstanceData: AssignTaskFormData) => {
      const { origin_task_type, origin_task_id, ...rest } = newTaskInstanceData;
      const formattedOriginTaskType = origin_task_type.toUpperCase() as "PREDEFINED" | "CASE" | "COMPANY";
      const payload: any = {
        ...rest,
        task_name: task?.task_name || "Untitled Task",
        origin_task_type: formattedOriginTaskType,
        origin_task_id: origin_task_id,
      };
      payload.start_date = payload.start_date || null;
      payload.due_date = payload.due_date || null;
      payload.completed_at = payload.completed_at || null;
      payload.actual_duration_days = payload.actual_duration_days === "" ? null : Number(payload.actual_duration_days) || null;
      payload.priority = Number(payload.priority) || 0;

      const { data, error } = await supabase.from("task_instances").insert(payload).select().single();
      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Failed to create task instance.");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Task assigned successfully! ✨");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['taskInstances', id, typeform.toUpperCase()] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign task: ${error.message}`);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTaskInstanceData: AssignTaskFormData & { task_instance_id: string }) => {
      const { origin_task_type, origin_task_id, task_instance_id, ...rest } = updatedTaskInstanceData;
      const payload: any = {
        ...rest,
        task_name: task?.task_name || "Untitled Task",
      };
      payload.start_date = payload.start_date || null;
      payload.due_date = payload.due_date || null;
      payload.completed_at = payload.completed_at || null;
      payload.actual_duration_days = payload.actual_duration_days === "" ? null : Number(payload.actual_duration_days) || null;
      payload.priority = Number(payload.priority) || 0;

      const { data, error } = await supabase
        .from("task_instances")
        .update(payload)
        .eq('task_instance_id', task_instance_id)
        .select()
        .single();
      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message || "Failed to update task instance.");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Task updated successfully! ✨");
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingTaskInstanceId(null);
      queryClient.invalidateQueries({ queryKey: ['taskInstances', id, typeform.toUpperCase()] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskInstanceId: string) => {
      const { error } = await supabase
        .from("task_instances")
        .delete()
        .eq('task_instance_id', taskInstanceId);
      if (error) {
        console.error("Supabase delete error:", error);
        throw new Error(error.message || "Failed to delete task instance.");
      }
    },
    onSuccess: () => {
      toast.success("Task instance deleted successfully! 🗑️");
      queryClient.invalidateQueries({ queryKey: ['taskInstances', id, typeform.toUpperCase()] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assigned_to) {
      toast.error("⚠️ Please select a user to assign the task to.");
      return;
    }
    if (!task) {
      toast.error("Parent task data is not available. Cannot assign.");
      return;
    }
    if (isEditMode && editingTaskInstanceId) {
      updateTaskMutation.mutate({ ...formData, task_instance_id: editingTaskInstanceId });
    } else {
      createTaskMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof AssignTaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenModal = () => {
    if (task) {
      setFormData({
        origin_task_type: typeform,
        origin_task_id: id,
        status: "NOT_STARTED",
        assigned_to: null,
        start_date: null,
        due_date: null,
        completed_at: null,
        description: task.description || "",
        priority: typeof task.priority === 'number' ? task.priority : 0,
        actual_duration_days: null,
      });
      setIsEditMode(false);
      setEditingTaskInstanceId(null);
      setIsModalOpen(true);
    } else {
      toast.warn("Task details are still loading. Please wait a moment.");
    }
  };

  const handleEdit = (instance: TaskInstance) => {
    if (task) {
      setFormData({
        origin_task_type: typeform,
        origin_task_id: id,
        status: instance.status || "NOT_STARTED",
        assigned_to: instance.assigned_to,
        start_date: instance.start_date,
        due_date: instance.due_date,
        completed_at: instance.completed_at,
        description: instance.description || task.description || "",
        priority: instance.priority || 0,
        actual_duration_days: instance.actual_duration_days || null,
      });
      setIsEditMode(true);
      setEditingTaskInstanceId(instance.task_instance_id);
      setIsModalOpen(true);
    } else {
      toast.warn("Task details are still loading. Please wait a moment.");
    }
  };

  const handleDelete = (taskInstanceId: string) => {
    setTaskInstanceToDelete(taskInstanceId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskInstanceToDelete) {
      deleteTaskMutation.mutate(taskInstanceToDelete);
      setTaskInstanceToDelete(null);
    }
  };

  if (taskLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="ml-3 text-lg text-gray-600">Loading Task Details...</p>
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">😢 Error Loading Task</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {taskError ? (taskError as Error).message : "The requested task could not be found or an error occurred."}
            </p>
            <Button onClick={() => navigate('/tasks')} variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
              Go Back to Tasks List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Task: <span className="text-indigo-600">{task.task_name}</span></h1>
        <Dialog.Root open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setIsEditMode(false);
            setEditingTaskInstanceId(null);
          }
        }}>
          <Dialog.Trigger asChild>
            <Button onClick={handleOpenModal} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md px-6 py-2.5">
              Assign New Instance
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl max-w-lg w-[90vw] sm:w-full max-h-[85vh] overflow-y-auto border border-gray-300 z-50">
              <Dialog.Title className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                {isEditMode ? "Edit Task Instance" : "Assign New Instance for"}: <span className="font-normal">{task.task_name}</span>
              </Dialog.Title>
              <TaskAssignmentForm
                formData={formData}
                onFormChange={handleInputChange}
                onSubmit={handleSubmit}
                profiles={profiles}
                profilesLoading={profilesLoading}
                isSubmitting={isEditMode ? updateTaskMutation.isPending : createTaskMutation.isPending}
                onClose={() => setIsModalOpen(false)}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Total Assigned Instances ({displayTaskInstances.length})</h2>
        {taskInstancesLoading && (
          <div className="flex flex-col justify-center items-center py-10 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="ml-2 mt-2 text-gray-500">Loading assigned tasks...</p>
          </div>
        )}
        {taskInstancesError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-600">
              Error loading task instances: {(taskInstancesError as Error).message}
            </CardContent>
          </Card>
        )}
        {!taskInstancesLoading && !taskInstancesError && (
          <Card className="shadow-xl border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 px-4 py-3">Task Name</TableHead>
                  <TableHead className="font-semibold text-slate-700 mx-auto px-4 py-3">Assigned To</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4 py-3">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4 mx-auto py-3">Start Date</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4 mx-auto py-3">Due Date</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700 px-4 py-3">Priority</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTaskInstances.length > 0 ? (
                  displayTaskInstances.map((instance) => (
                    <TableRow key={instance.task_instance_id} className="hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-b-0">
                      <TableCell className="font-medium text-gray-800 px-4 py-3">{instance.task_name}</TableCell>
                      <TableCell className="text-gray-600 px-4 py-3">{instance.assigned_to_name}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${
                          instance.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-300' :
                          instance.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          instance.status === 'NOT_STARTED' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                          instance.status === 'BLOCKED' ? 'bg-red-100 text-red-800 border border-red-300' :
                          instance.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          'bg-purple-100 text-purple-800 border border-purple-300'
                        }`}>
                          {(instance.status || "UNKNOWN").replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 px-4 py-3">{instance.start_date ? new Date(instance.start_date).toLocaleDateString() : <span className="italic text-gray-400">N/A</span>}</TableCell>
                      <TableCell className="text-gray-600 px-4 py-3">{instance.due_date ? new Date(instance.due_date).toLocaleDateString() : <span className="italic text-gray-400">N/A</span>}</TableCell>
                      <TableCell className="text-center text-gray-700 font-medium px-4 py-3">{instance.priority}</TableCell>
                      <TableCell className="px-4 py-3">
                        <ActionButtons
                          taskInstanceId={instance.task_instance_id}
                          onEdit={() => handleEdit(instance)}
                          onDelete={() => handleDelete(instance.task_instance_id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-10 text-lg">
                      😕 No task instances found for this origin task yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this task instance?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
      />

      <Button
        variant="outline"
        onClick={() => navigate("/tasks")}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-lg p-3 rounded-full h-auto z-30"
        title="Back to Tasks List"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default TaskAssignmentPage;