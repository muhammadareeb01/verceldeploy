// src/api/tasks.ts
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/types"; // Assuming UserRole is defined and available
import {
  TaskInstance,
  TaskInstanceStatus,
  TaskOriginType,
  TaskStatus as TaskStatusObject, // Alias for clarity, defined in types/tasks.ts
  PredefinedTask,
  CaseTask,
  CompanyTask,
} from "@/types/tasks";

// --- Locally Defined Helper Types for API function parameters ---
interface TaskInstanceFilter {
  assignedToUserId?: string;
  status?: TaskInstanceStatus[] | TaskInstanceStatus; // Uses the enum directly
  priority?: number[] | number;
  originTaskType?: TaskOriginType; // Uses the enum directly
  originTaskId?: string;
  active?: boolean;
  searchQuery?: string;
  serviceId?: string; // For filtering by predefined_tasks.service_id
  caseIdForOrigin?: string; // For filtering by case_tasks.case_id
  companyIdForOrigin?: string; // For filtering by company_tasks.company_id
}

interface TaskInstanceSort {
  field: keyof TaskInstance | 'created_at' | 'updated_at' | string;
  direction: "asc" | "desc";
}

// Updated TaskInstanceCreateData to support separate foreign keys
type TaskInstanceCreateData = Omit<
  TaskInstance,
  'task_instance_id' | 'status' | 'completed_at' | 'actual_duration_days' | 'start_date' | 'due_date' | 'origin_type' | 'origin_task_id'
> & {
  status: TaskInstanceStatus; // Input status as enum
  start_date: string; // Dates as ISO strings from input
  due_date: string;   // Dates as ISO strings from input
  predefined_task_id?: string; // Foreign key for predefined tasks
  case_task_id?: string;       // Foreign key for case tasks
  company_task_id?: string;    // Foreign key for company tasks
};

// For updating an existing TaskInstance
type TaskInstanceUpdateData = Partial<
  Omit<TaskInstance, 'task_instance_id' | 'status' | 'start_date' | 'due_date' | 'completed_at' | 'origin_type' | 'origin_task_id'>
> & {
  status?: TaskInstanceStatus; // Optional: input status as enum
  start_date?: string;
  due_date?: string;
  completed_at?: string | null;
  predefined_task_id?: string;
  case_task_id?: string;
  company_task_id?: string;
};

// For creating Task Definitions
type PredefinedTaskDefinitionCreateData = Omit<PredefinedTask, 'predefined_task_id'>;
type CaseTaskDefinitionCreateData = Omit<CaseTask, 'case_task_id'>;
type CompanyTaskDefinitionCreateData = Omit<CompanyTask, 'company_task_id'>;

// --- Helper Functions ---

const statusEnumToDisplayName = (statusEnum: TaskInstanceStatus): string => {
  return statusEnum
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const transformTaskInstance = (dbRecord: any): TaskInstance | null => {
  if (!dbRecord || !dbRecord.task_instance_id) return null;

  const dbStatus = dbRecord.status as TaskInstanceStatus | undefined;
  const taskStatusObject: TaskStatusObject = dbStatus && Object.values(TaskInstanceStatus).includes(dbStatus)
    ? { id: dbStatus, name: statusEnumToDisplayName(dbStatus) }
    : { id: TaskInstanceStatus.NOT_STARTED, name: statusEnumToDisplayName(TaskInstanceStatus.NOT_STARTED) };

  // Determine origin_type based on which foreign key is present
  let originType: TaskOriginType;
  let originTaskId: string = "";
  if (dbRecord.predefined_task_id) {
    originType = TaskOriginType.PREDEFINED;
    originTaskId = dbRecord.predefined_task_id;
  } else if (dbRecord.case_task_id) {
    originType = TaskOriginType.CASE;
    originTaskId = dbRecord.case_task_id;
  } else if (dbRecord.company_task_id) {
    originType = TaskOriginType.COMPANY;
    originTaskId = dbRecord.company_task_id;
  } else {
    // Default to PREDEFINED if no foreign key is set (shouldn't happen)
    originType = TaskOriginType.PREDEFINED;
  }

  const instance: TaskInstance = {
    task_instance_id: dbRecord.task_instance_id,
    task_name: dbRecord.task_name || "",
    description: dbRecord.description || "",
    origin_type: originType,
    origin_task_id: originTaskId,
    uploaded_document_id: dbRecord.uploaded_document_id || "",
    status: taskStatusObject,
    assigned_to: dbRecord.assigned_to || "",
    start_date: dbRecord.start_date ? new Date(dbRecord.start_date) : new Date(0),
    due_date: dbRecord.due_date ? new Date(dbRecord.due_date) : new Date(0),
    completed_at: dbRecord.completed_at ? new Date(dbRecord.completed_at) : null,
    actual_duration_days: typeof dbRecord.actual_duration_days === 'number' ? dbRecord.actual_duration_days : 0,
    priority: typeof dbRecord.priority === 'number' ? dbRecord.priority : 0,
    active: dbRecord.active ?? false,
    notes: dbRecord.notes || "",
  };
  return instance;
};

// --- Task Instance API Functions ---

export const getTaskInstancesByFilters = async (
  filters: TaskInstanceFilter = {},
  sort?: TaskInstanceSort
): Promise<TaskInstance[]> => {
  try {
    let query = supabase
      .from("task_instances")
      .select(`
        task_instance_id, task_name, description, predefined_task_id, case_task_id, company_task_id,
        uploaded_document_id, status, assigned_to, start_date, due_date, 
        completed_at, actual_duration_days, priority, active, notes,
        created_at, updated_at 
      `);

    if (filters.assignedToUserId) query = query.eq("assigned_to", filters.assignedToUserId);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (statuses.length > 0) query = query.in("status", statuses.map(s => s.toString()));
    }
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      if (priorities.length > 0) query = query.in("priority", priorities);
    }
    if (filters.active !== undefined && filters.active !== null) query = query.eq("active", filters.active);
    if (filters.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      query = query.or(`task_name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    if (filters.serviceId) {
      const { data: predefinedTaskIds, error: ptError } = await supabase
        .from("predefined_tasks")
        .select("predefined_task_id")
        .eq("service_id", filters.serviceId);
      if (ptError) throw ptError;
      const ids = predefinedTaskIds?.map((pt) => pt.predefined_task_id) || [];
      if (ids.length > 0) {
        query = query.in("predefined_task_id", ids);
      } else { return []; }
    }

    if (filters.caseIdForOrigin) {
      const { data: caseTaskOriginIds, error: ctError } = await supabase
        .from("case_tasks")
        .select("case_task_id")
        .eq("case_id", filters.caseIdForOrigin);
      if (ctError) throw ctError;
      const ids = caseTaskOriginIds?.map((ct) => ct.case_task_id) || [];
      if (ids.length > 0) {
        query = query.in("case_task_id", ids);
      } else { return []; }
    }
    if (filters.companyIdForOrigin) {
      const { data: companyTaskOriginIds, error: coError } = await supabase
        .from("company_tasks")
        .select("company_task_id")
        .eq("company_id", filters.companyIdForOrigin);
      if (coError) throw coError;
      const ids = companyTaskOriginIds?.map((ct) => ct.company_task_id) || [];
      if (ids.length > 0) {
        query = query.in("company_task_id", ids);
      } else { return []; }
    }

    const sortField = sort?.field || "created_at";
    query = query.order(sortField as string, { ascending: sort?.direction === "asc" });

    const { data: dbRecords, error } = await query;
    if (error) throw error;

    return (dbRecords || [])
      .map(transformTaskInstance)
      .filter((t): t is TaskInstance => t !== null);
  } catch (error: any) {
    console.error("Error in getTaskInstancesByFilters:", error);
    throw new Error(`${error.message || "An unexpected error occurred"}. Contact support.`);
  }
};

export const getTaskInstancesByCaseId = async (caseId: string): Promise<TaskInstance[]> => {
  if (!caseId) return [];
  return getTaskInstancesByFilters({ caseIdForOrigin: caseId });
};

export const getTaskInstancesByCompanyId = async (companyId: string): Promise<TaskInstance[]> => {
  if (!companyId) return [];
  return getTaskInstancesByFilters({ companyIdForOrigin: companyId });
};

export const getTaskInstancesByAssignedUserId = async (userId: string): Promise<TaskInstance[]> => {
  if (!userId) return [];
  return getTaskInstancesByFilters({ assignedToUserId: userId });
};

export const getTaskInstanceById = async (taskInstanceId: string): Promise<TaskInstance | null> => {
  if (!taskInstanceId) return null;
  try {
    const { data: dbRecord, error } = await supabase
      .from("task_instances")
      .select(`
        task_instance_id, task_name, description, predefined_task_id, case_task_id, company_task_id,
        uploaded_document_id, status, assigned_to, start_date, due_date, 
        completed_at, actual_duration_days, priority, active, notes,
        created_at, updated_at 
      `)
      .eq("task_instance_id", taskInstanceId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!dbRecord) return null;

    return transformTaskInstance(dbRecord);
  } catch (error: any) {
    console.error(`Error in getTaskInstanceById ${taskInstanceId}:`, error);
    throw new Error(`${error.message || "An unexpected error occurred"}. Contact support.`);
  }
};

export const createTaskInstance = async (
  instanceData: TaskInstanceCreateData
): Promise<TaskInstance> => {
  try {
    if (!instanceData.task_name) {
      throw new Error("Task name is required to create a task instance.");
    }

    const dbPayload = {
      task_name: instanceData.task_name,
      description: instanceData.description,
      predefined_task_id: instanceData.predefined_task_id,
      case_task_id: instanceData.case_task_id,
      company_task_id: instanceData.company_task_id,
      uploaded_document_id: instanceData.uploaded_document_id,
      status: instanceData.status,
      assigned_to: instanceData.assigned_to,
      start_date: instanceData.start_date,
      due_date: instanceData.due_date,
      priority: instanceData.priority,
      active: instanceData.active,
      notes: instanceData.notes,
    };

    const { data: newDbInstance, error } = await supabase
      .from("task_instances")
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    if (!newDbInstance) throw new Error("Failed to create task instance: No data returned.");

    const transformed = transformTaskInstance(newDbInstance);
    if (!transformed) throw new Error("Failed to transform created task instance.");
    return transformed;
  } catch (error: any) {
    console.error("Error in createTaskInstance:", error);
    throw new Error(error.message || "An unexpected error occurred. Contact support.");
  }
};

export const updateTaskInstance = async (
  taskInstanceId: string,
  updateData: TaskInstanceUpdateData
): Promise<TaskInstance> => {
  try {
    const dbPayload: { [key: string]: any } = {};

    if (updateData.task_name !== undefined) dbPayload.task_name = updateData.task_name;
    if (updateData.description !== undefined) dbPayload.description = updateData.description;
    if (updateData.predefined_task_id !== undefined) dbPayload.predefined_task_id = updateData.predefined_task_id;
    if (updateData.case_task_id !== undefined) dbPayload.case_task_id = updateData.case_task_id;
    if (updateData.company_task_id !== undefined) dbPayload.company_task_id = updateData.company_task_id;
    if (updateData.uploaded_document_id !== undefined) dbPayload.uploaded_document_id = updateData.uploaded_document_id;
    if (updateData.status !== undefined) dbPayload.status = updateData.status.toString();
    if (updateData.assigned_to !== undefined) dbPayload.assigned_to = updateData.assigned_to;
    if (updateData.start_date !== undefined) dbPayload.start_date = updateData.start_date;
    if (updateData.due_date !== undefined) dbPayload.due_date = updateData.due_date;
    if (updateData.completed_at !== undefined) dbPayload.completed_at = updateData.completed_at;
    if (updateData.actual_duration_days !== undefined) dbPayload.actual_duration_days = updateData.actual_duration_days;
    if (updateData.priority !== undefined) dbPayload.priority = updateData.priority;
    if (updateData.active !== undefined) dbPayload.active = updateData.active;
    if (updateData.notes !== undefined) dbPayload.notes = updateData.notes;

    if (Object.keys(dbPayload).length === 0) {
      const currentInstance = await getTaskInstanceById(taskInstanceId);
      if (!currentInstance) throw new Error(`Task instance with ID ${taskInstanceId} not found.`);
      return currentInstance;
    }

    const { data: updatedDbInstance, error } = await supabase
      .from("task_instances")
      .update(dbPayload)
      .eq("task_instance_id", taskInstanceId)
      .select()
      .single();

    if (error) throw error;
    if (!updatedDbInstance) throw new Error(`Task instance with ID ${taskInstanceId} not found or update failed.`);

    const transformed = transformTaskInstance(updatedDbInstance);
    if (!transformed) throw new Error("Failed to transform updated task instance.");
    return transformed;
  } catch (error: any) {
    console.error(`Error in updateTaskInstance ${taskInstanceId}:`, error);
    throw new Error(error.message || "An unexpected error occurred. Contact support.");
  }
};

export const deleteTaskInstance = async (taskInstanceId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("task_instances")
      .delete()
      .eq("task_instance_id", taskInstanceId);
    if (error && error.code !== "PGRST116") throw error;
  } catch (error: any) {
    console.error(`Error in deleteTaskInstance ${taskInstanceId}:`, error);
    throw new Error(error.message || "An unexpected error occurred. Contact support.");
  }
};

export const toggleTaskInstanceStatus = async (
  taskInstanceId: string,
  currentStatusEnumValue?: TaskInstanceStatus | null
): Promise<TaskInstance> => {
  try {
    let newStatusEnum: TaskInstanceStatus;
    switch (currentStatusEnumValue) {
      case TaskInstanceStatus.NOT_STARTED: newStatusEnum = TaskInstanceStatus.IN_PROGRESS; break;
      case TaskInstanceStatus.IN_PROGRESS: newStatusEnum = TaskInstanceStatus.COMPLETED; break;
      case TaskInstanceStatus.COMPLETED: newStatusEnum = TaskInstanceStatus.NOT_STARTED; break;
      case TaskInstanceStatus.BLOCKED: newStatusEnum = TaskInstanceStatus.IN_PROGRESS; break;
      case TaskInstanceStatus.ON_HOLD: newStatusEnum = TaskInstanceStatus.IN_PROGRESS; break;
      default: newStatusEnum = TaskInstanceStatus.NOT_STARTED;
    }
    return updateTaskInstance(taskInstanceId, { status: newStatusEnum });
  } catch (error: any) {
    console.error(`Error in toggleTaskInstanceStatus ${taskInstanceId}:`, error);
    throw new Error(error.message || "An unexpected error occurred. Contact support.");
  }
};

export const getTaskInstancesCountByFilters = async (
  filters: TaskInstanceFilter = {}
): Promise<number> => {
  try {
    let query = supabase
      .from("task_instances")
      .select("*", { count: "exact", head: true });

    if (filters.assignedToUserId) query = query.eq("assigned_to", filters.assignedToUserId);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (statuses.length > 0) query = query.in("status", statuses.map(s => s.toString()));
    }
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      if (priorities.length > 0) query = query.in("priority", priorities);
    }
    if (filters.active !== undefined && filters.active !== null) query = query.eq("active", filters.active);
    if (filters.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      query = query.or(`task_name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    if (filters.serviceId) {
      const { data: predefinedTaskIds, error: ptError } = await supabase
        .from("predefined_tasks")
        .select("predefined_task_id", { count: "exact", head: true })
        .eq("service_id", filters.serviceId);
      if (ptError) throw ptError;
      const ids = predefinedTaskIds?.map((pt: any) => pt.predefined_task_id) || [];
      if (ids.length > 0) {
        query = query.in("predefined_task_id", ids);
      } else {
        return 0;
      }
    }
    if (filters.caseIdForOrigin) {
      const { data: caseTaskOriginIds, error: ctError } = await supabase
        .from("case_tasks").select("case_task_id").eq("case_id", filters.caseIdForOrigin);
      if (ctError) throw ctError;
      const ids = caseTaskOriginIds?.map((ct: any) => ct.case_task_id) || [];
      if (ids.length > 0) {
        query = query.in("case_task_id", ids);
      } else { return 0; }
    }
    if (filters.companyIdForOrigin) {
      const { data: companyTaskOriginIds, error: coError } = await supabase
        .from("company_tasks").select("company_task_id").eq("company_id", filters.companyIdForOrigin);
      if (coError) throw coError;
      const ids = companyTaskOriginIds?.map((ct: any) => ct.company_task_id) || [];
      if (ids.length > 0) {
        query = query.in("company_task_id", ids);
      } else { return 0; }
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error("Error in getTaskInstancesCountByFilters:", error);
    throw new Error(error.message || "An unexpected error occurred. Contact support.");
  }
};

// --- Task Definition API Functions ---

const transformPredefinedTask = (dbRecord: any): PredefinedTask | null => {
  if (!dbRecord || !dbRecord.predefined_task_id) return null;
  return {
    predefined_task_id: dbRecord.predefined_task_id,
    task_name: dbRecord.task_name || "",
    description: dbRecord.description || "",
    service_id: dbRecord.service_id || "",
    task_category_id: dbRecord.task_category_id || "",
    document_type_id: dbRecord.document_type_id || "",
    default_responsible_role: dbRecord.default_responsible_role || "",
    typical_duration_days: typeof dbRecord.typical_duration_days === 'number' ? dbRecord.typical_duration_days : 0,
    priority: typeof dbRecord.priority === 'number' ? dbRecord.priority : 0,
  };
};

const transformCaseTask = (dbRecord: any): CaseTask | null => {
  if (!dbRecord || !dbRecord.case_task_id) return null;
  return {
    case_task_id: dbRecord.case_task_id,
    case_id: dbRecord.case_id || "",
    task_name: dbRecord.task_name || "",
    description: dbRecord.description || "",
    task_category_id: dbRecord.task_category_id || "",
    document_type_id: dbRecord.document_type_id || "",
    priority: typeof dbRecord.priority === 'number' ? dbRecord.priority : 0,
  };
};

const transformCompanyTask = (dbRecord: any): CompanyTask | null => {
  if (!dbRecord || !dbRecord.company_task_id) return null;
  return {
    company_task_id: dbRecord.company_task_id,
    company_id: dbRecord.company_id || "",
    task_name: dbRecord.task_name || "",
    description: dbRecord.description || "",
    task_category_id: dbRecord.task_category_id || "",
    document_type_id: dbRecord.document_type_id || "",
    priority: typeof dbRecord.priority === 'number' ? dbRecord.priority : 0,
  };
};

export const createPredefinedTaskDefinition = async (
  definitionData: PredefinedTaskDefinitionCreateData
): Promise<PredefinedTask> => {
  try {
    const { data: newDbRecord, error } = await supabase
      .from("predefined_tasks")
      .insert(definitionData)
      .select()
      .single();

    if (error) throw error;
    if (!newDbRecord) throw new Error("Failed to create predefined task definition.");
    
    const transformed = transformPredefinedTask(newDbRecord);
    if (!transformed) throw new Error("Failed to transform created predefined task definition.");
    return transformed;
  } catch (error: any) {
    console.error("Error in createPredefinedTaskDefinition:", error);
    throw new Error(error.message || "Failed to create predefined task definition. Contact support.");
  }
};

export const createCaseTaskDefinition = async (
  definitionData: CaseTaskDefinitionCreateData
): Promise<CaseTask> => {
  try {
    const { data: newDbRecord, error } = await supabase
      .from("case_tasks")
      .insert(definitionData)
      .select()
      .single();

    if (error) throw error;
    if (!newDbRecord) throw new Error("Failed to create case task definition.");
    
    const transformed = transformCaseTask(newDbRecord);
    if (!transformed) throw new Error("Failed to transform created case task definition.");
    return transformed;
  } catch (error: any) {
    console.error("Error in createCaseTaskDefinition:", error);
    throw new Error(error.message || "Failed to create case task definition. Contact support.");
  }
};

export const createCompanyTaskDefinition = async (
  definitionData: CompanyTaskDefinitionCreateData
): Promise<CompanyTask> => {
  try {
    const { data: newDbRecord, error } = await supabase
      .from("company_tasks")
      .insert(definitionData)
      .select()
      .single();

    if (error) throw error;
    if (!newDbRecord) throw new Error("Failed to create company task definition.");

    const transformed = transformCompanyTask(newDbRecord);
    if (!transformed) throw new Error("Failed to transform created company task definition.");
    return transformed;
  } catch (error: any) {
    console.error("Error in createCompanyTaskDefinition:", error);
    throw new Error(error.message || "Failed to create company task definition. Contact support.");
  }
};