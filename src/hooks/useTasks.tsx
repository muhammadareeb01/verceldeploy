import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  TaskInstance,
  TaskInstanceStatus,
  PredefinedTask,
  CaseTask,
  CompanyTask,
  TaskOriginType,
  ApiTask,
  UserRole,
} from "@/types/tasks";

import {
  getTaskInstancesByFilters,
  getTaskInstanceById,
  getTaskInstancesByCaseId,
  getTaskInstancesByCompanyId,
  getTaskInstancesByAssignedUserId,
  createTaskInstance,
  updateTaskInstance,
  deleteTaskInstance,
  toggleTaskInstanceStatus,
  getTaskInstancesCountByFilters,
  createPredefinedTaskDefinition,
  createCaseTaskDefinition,
  createCompanyTaskDefinition,
} from "@/api/tasks";

export const taskInstanceKeys = {
  all: ["task_instances"] as const,
  lists: (filters?: object, sort?: object) =>
    [...taskInstanceKeys.all, "list", filters ? JSON.stringify(filters) : {}, sort ? JSON.stringify(sort) : {}] as const,
  detail: (taskInstanceId: string) =>
    [...taskInstanceKeys.all, "detail", taskInstanceId] as const,
  byCase: (caseId: string) =>
    [...taskInstanceKeys.all, "byCase", caseId] as const,
  byCompany: (companyId: string) =>
    [...taskInstanceKeys.all, "byCompany", companyId] as const,
  byAssignedUser: (userId: string) =>
    [...taskInstanceKeys.all, "byAssignedUser", userId] as const,
  count: (filters?: object) =>
    ["task_instances", "count", filters ? JSON.stringify(filters) : "all"] as const,
};

export const taskDefinitionKeys = {
  all: ["task_definitions"] as const,
  lists: (filters?: object, sort?: object, fetchType?: string) =>
    [...taskDefinitionKeys.all, "list", fetchType || "all", filters ? JSON.stringify(filters) : {}, sort ? JSON.stringify(sort) : {}] as const,
};

interface TaskDefinitionFilter {
  searchQuery?: string;
  priority?: number[] | number;
  task_category_id?: string;
  document_type_id?: string;
  service_id?: string; // Confirmed to be present
  case_id?: string;
  company_id?: string;
}

interface TaskDefinitionSort {
  field: "task_name" | "priority" | "created_at" | "updated_at" | string;
  direction: "asc" | "desc";
}

export const useTaskInstancesQuery = (filters?: object, sort?: object) => {
  return useQuery<TaskInstance[], Error>({
    queryKey: taskInstanceKeys.lists(filters, sort),
    queryFn: () => getTaskInstancesByFilters(filters as any, sort as any),
  });
};

export const useTaskInstancesByCaseIdQuery = (caseId?: string) => {
  return useQuery<TaskInstance[], Error>({
    queryKey: taskInstanceKeys.byCase(caseId || "all"),
    queryFn: () => getTaskInstancesByCaseId(caseId || ""),
    enabled: !!caseId,
  });
};

export const useTaskInstancesByCompanyIdQuery = (companyId?: string) => {
  return useQuery<TaskInstance[], Error>({
    queryKey: taskInstanceKeys.byCompany(companyId || "all"),
    queryFn: () => getTaskInstancesByCompanyId(companyId || ""),
    enabled: !!companyId,
  });
};

export const useTaskInstancesByAssignedUserIdQuery = (userId?: string) => {
  return useQuery<TaskInstance[], Error>({
    queryKey: taskInstanceKeys.byAssignedUser(userId || "all"),
    queryFn: () => getTaskInstancesByAssignedUserId(userId || ""),
    enabled: !!userId,
  });
};

export const useTaskInstanceByIdQuery = (taskInstanceId?: string) => {
  return useQuery<TaskInstance | null, Error>({
    queryKey: taskInstanceKeys.detail(taskInstanceId || "none"),
    queryFn: () => getTaskInstanceById(taskInstanceId || ""),
    enabled: !!taskInstanceId,
  });
};

export const useCreateTaskInstanceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<TaskInstance, Error, any>({
    mutationFn: createTaskInstance,
    onSuccess: (newTaskInstance) => {
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.count() });
      if (newTaskInstance.origin_type === TaskOriginType.CASE && newTaskInstance.origin_task_id) {
        queryClient.invalidateQueries({
          queryKey: taskInstanceKeys.byCase(newTaskInstance.origin_task_id),
        });
      }
      if (newTaskInstance.origin_type === TaskOriginType.COMPANY && newTaskInstance.origin_task_id) {
        queryClient.invalidateQueries({
          queryKey: taskInstanceKeys.byCompany(newTaskInstance.origin_task_id)
        });
      }
      if (newTaskInstance.assigned_to) {
        queryClient.invalidateQueries({
          queryKey: taskInstanceKeys.byAssignedUser(newTaskInstance.assigned_to),
        });
      }
      queryClient.setQueryData(
        taskInstanceKeys.detail(newTaskInstance.task_instance_id),
        newTaskInstance
      );
      toast.success(`Task "${newTaskInstance.task_name}" created successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create task instance: ${error.message}`);
    },
  });
};

export const useUpdateTaskInstanceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    TaskInstance,
    Error,
    { taskInstanceId: string; data: Partial<Omit<TaskInstance, 'task_instance_id'>> }
  >({
    mutationFn: ({ taskInstanceId, data }) =>
      updateTaskInstance(taskInstanceId, data),
    onSuccess: (updatedTaskInstance) => {
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.count() });
      queryClient.setQueryData(
        taskInstanceKeys.detail(updatedTaskInstance.task_instance_id),
        updatedTaskInstance
      );
      toast.success(`Task "${updatedTaskInstance.task_name}" updated successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};

export const useDeleteTaskInstanceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    string
  >({
    mutationFn: deleteTaskInstance,
    onSuccess: (_, deletedTaskInstanceId) => {
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.count() });
      queryClient.removeQueries({ queryKey: taskInstanceKeys.detail(deletedTaskInstanceId) });
      toast.success(`Task instance deleted successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete task instance: ${error.message}`);
    },
  });
};

export const useToggleTaskInstanceStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    TaskInstance,
    Error,
    { taskInstanceId: string; currentStatus?: TaskInstanceStatus | null }
  >({
    mutationFn: ({ taskInstanceId, currentStatus }) =>
      toggleTaskInstanceStatus(taskInstanceId, currentStatus),
    onSuccess: (updatedTaskInstance) => {
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskInstanceKeys.count() });
      queryClient.setQueryData(
        taskInstanceKeys.detail(updatedTaskInstance.task_instance_id),
        updatedTaskInstance
      );
      if (updatedTaskInstance.origin_type === TaskOriginType.CASE && updatedTaskInstance.origin_task_id) {
        queryClient.invalidateQueries({
          queryKey: taskInstanceKeys.byCase(updatedTaskInstance.origin_task_id),
        });
      }
      if (updatedTaskInstance.origin_type === TaskOriginType.COMPANY && updatedTaskInstance.origin_task_id) {
        queryClient.invalidateQueries({
          queryKey: taskInstanceKeys.byCompany(updatedTaskInstance.origin_task_id)
        });
      }
      if (updatedTaskInstance.assigned_to) {
        queryClient.invalidateQueries({
          queryKey: taskInstanceKeys.byAssignedUser(updatedTaskInstance.assigned_to),
        });
      }
      toast.success(
        `Task "${updatedTaskInstance.task_name}" status updated to ${updatedTaskInstance.status.name}.`
      );
    },
    onError: (error: any) => {
      toast.error(`Failed to update task instance status: ${error.message}`);
    },
  });
};

export const useTaskInstancesCountByFilters = (filters: object = {}) => {
  return useQuery<number, Error>({
    queryKey: taskInstanceKeys.count(filters),
    queryFn: () => getTaskInstancesCountByFilters(filters as any),
  });
};

export type TaskDefinitionCreateInput =
  | ({ formType: "predefined" } & Partial<Omit<PredefinedTask, 'predefined_task_id' | 'origin_type' | 'created_at' | 'updated_at'>>)
  | ({ formType: "case" } & Partial<Omit<CaseTask, 'case_task_id' | 'origin_type' | 'created_at' | 'updated_at'>>)
  | ({ formType: "company" } & Partial<Omit<CompanyTask, 'company_task_id' | 'origin_type' | 'created_at' | 'updated_at'>>);

export const transformDbRecordToDefinitionApiTask = (dbRecord: any, originType: TaskOriginType): ApiTask | null => {
  if (!dbRecord) return null;
  const specificId = dbRecord.task_id;
  if (!specificId) {
    console.warn(`transformDbRecordToDefinitionApiTask: specificId (aliased as task_id) for ${originType} is missing. Record:`, dbRecord);
    return null;
  }
  const commonFields = {
    task_name: dbRecord.task_name || "",
    description: dbRecord.description || "",
    priority: typeof dbRecord.priority === 'number' ? dbRecord.priority : 0,
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
      } as PredefinedTask;
    case TaskOriginType.CASE:
      return { ...commonFields, case_task_id: specificId, task_id: specificId, origin_type: TaskOriginType.CASE, case_id: dbRecord.case_id } as CaseTask;
    case TaskOriginType.COMPANY:
      return { ...commonFields, company_task_id: specificId, task_id: specificId, origin_type: TaskOriginType.COMPANY, company_id: dbRecord.company_id } as CompanyTask;
    default: return null;
  }
};

export const getTaskDefinitionsByFilters = async (
  filters: TaskDefinitionFilter = {},
  sort?: TaskDefinitionSort,
  fetchType: TaskOriginType | "all" = "all"
): Promise<ApiTask[]> => {
  console.log(`[HOOKS] getTaskDefinitionsByFilters called with: fetchType="${fetchType}", filters:`, JSON.stringify(filters), "sort:", sort);

  try {
    const tableConfigs = [];

    if (fetchType === "all" || fetchType === TaskOriginType.PREDEFINED) {
      console.log(`[HOOKS] Adding PREDEFINED config for fetchType: ${fetchType}`);
      tableConfigs.push({
        table: "predefined_tasks",
        idField: "predefined_task_id",
        originType: TaskOriginType.PREDEFINED,
        specificFields: "service_id, default_responsible_role, typical_duration_days, description"
      });
    }
    if (fetchType === "all" || fetchType === TaskOriginType.CASE) {
      console.log(`[HOOKS] Adding CASE config for fetchType: ${fetchType}`);
      tableConfigs.push({
        table: "case_tasks",
        idField: "case_task_id",
        originType: TaskOriginType.CASE,
        specificFields: "case_id, description"
      });
    }
    if (fetchType === "all" || fetchType === TaskOriginType.COMPANY) {
      console.log(`[HOOKS] Adding COMPANY config for fetchType: ${fetchType}`);
      tableConfigs.push({
        table: "company_tasks",
        idField: "company_task_id",
        originType: TaskOriginType.COMPANY,
        specificFields: "company_id, description"
      });
    }

    console.log("[HOOKS] Effective tableConfigs:", tableConfigs);
    const results: ApiTask[] = [];

    for (const config of tableConfigs) {
      console.log(`[HOOKS] Processing config for table: ${config.table}`);
      let selectFields = `task_id:${config.idField}, task_name, description, priority, task_category_id, document_type_id, created_at, updated_at`;
      if (config.specificFields) {
        selectFields += `, ${config.specificFields}`;
      }
      const cleanedSelectFields = selectFields.replace(/\s+/g, ' ').trim();
      console.log(`[HOOKS] SELECT fields for ${config.table}: "${cleanedSelectFields}"`);

      let query = supabase.from(config.table).select(cleanedSelectFields);

      // Apply common filters
      if (filters.searchQuery) {
        console.log(`[HOOKS] Applying searchQuery: "${filters.searchQuery}" to ${config.table}`);
        query = query.or(`task_name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }
      if (filters.priority !== undefined) {
        const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        if (priorities.length > 0) {
          console.log(`[HOOKS] Applying priority filter: ${priorities} to ${config.table}`);
          query = query.in("priority", priorities);
        }
      }
      if (filters.task_category_id) {
        console.log(`[HOOKS] Applying task_category_id: "${filters.task_category_id}" to ${config.table}`);
        query = query.eq("task_category_id", filters.task_category_id);
      }
      if (filters.document_type_id) {
        console.log(`[HOOKS] Applying document_type_id: "${filters.document_type_id}" to ${config.table}`);
        query = query.eq("document_type_id", filters.document_type_id);
      }

      // Apply type-specific filters
      if (filters.service_id && config.originType === TaskOriginType.PREDEFINED) {
        console.log(`[HOOKS] Applying service_id: "${filters.service_id}" to ${config.table}`);
        query = query.eq("service_id", filters.service_id);
      }
      if (filters.case_id && config.originType === TaskOriginType.CASE) {
        console.log(`[HOOKS] Applying case_id: "${filters.case_id}" to ${config.table}`);
        query = query.eq("case_id", filters.case_id);
      }
      if (filters.company_id && config.originType === TaskOriginType.COMPANY) {
        console.log(`[HOOKS] Applying company_id: "${filters.company_id}" to ${config.table}`);
        query = query.eq("company_id", filters.company_id);
      }

      const sortField = sort?.field || "created_at";
      query = query.order(sortField, { ascending: sort?.direction === "asc" });
      console.log(`[HOOKS] Sorting ${config.table} by ${sortField} ${sort?.direction || "asc"}`);

      const { data: dbRecords, error } = await query;

      if (error) {
        console.error(`[HOOKS] Supabase error fetching data from ${config.table}:`, error);
        throw error;
      }
      console.log(`[HOOKS] Raw dbRecords from ${config.table} (before transform):`, dbRecords);

      const transformed = (dbRecords || [])
        .map((record) => transformDbRecordToDefinitionApiTask(record, config.originType))
        .filter((t): t is ApiTask => {
          if (t === null) {
            console.warn(`[HOOKS] transformDbRecordToDefinitionApiTask returned null for a record from ${config.table}`);
          }
          return t !== null;
        });
      console.log(`[HOOKS] Transformed records for ${config.table} (count: ${transformed.length}):`, transformed);
      results.push(...transformed);
    }

    if (fetchType === "all" && results.length > 0 && sort) {
      console.log(`[HOOKS] Client-side sorting for "all" fetchType, field: ${sort.field}`);
      results.sort((a, b) => {
        const aValue = a[sort.field as keyof ApiTask] as string | number;
        const bValue = b[sort.field as keyof ApiTask] as string | number;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sort.direction === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      });
    }
    console.log(`[HOOKS] getTaskDefinitionsByFilters returning total results: ${results.length}`);
    return results;
  } catch (error: any) {
    console.error("[HOOKS] Error in getTaskDefinitionsByFilters (outer catch):", error);
    throw new Error(`${error.message || "An unexpected error occurred while fetching task definitions."}`);
  }
};

export const useTaskDefinitionsQuery = (
  filters?: TaskDefinitionFilter,
  sort?: TaskDefinitionSort,
  fetchType: TaskOriginType | "all" = "all"
): UseQueryResult<ApiTask[], Error> => {
  return useQuery<ApiTask[], Error>({
    queryKey: taskDefinitionKeys.lists(filters, sort, fetchType),
    queryFn: () => getTaskDefinitionsByFilters(filters, sort, fetchType),
  });
};

export const useCreateTaskDefinitionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiTask,
    Error,
    TaskDefinitionCreateInput
  >({
    mutationFn: async (data: TaskDefinitionCreateInput): Promise<ApiTask> => {
      const { formType, ...definitionPayload } = data;
      let createdRawRecord: any;

      switch (formType) {
        case "predefined":
          if ('default_responsible_user_role' in definitionPayload && definitionPayload.default_responsible_user_role !== undefined) {
            (definitionPayload as any).default_responsible_role = definitionPayload.default_responsible_user_role;
            delete (definitionPayload as any).default_responsible_user_role;
          }
          createdRawRecord = await createPredefinedTaskDefinition(definitionPayload as Omit<PredefinedTask, 'predefined_task_id' | 'origin_type' | 'created_at' | 'updated_at'>);
          return transformDbRecordToDefinitionApiTask(
            { ...createdRawRecord, task_id: createdRawRecord.predefined_task_id },
            TaskOriginType.PREDEFINED
          )!;
        case "case":
          createdRawRecord = await createCaseTaskDefinition(definitionPayload as Omit<CaseTask, 'case_task_id' | 'origin_type' | 'created_at' | 'updated_at'>);
          return transformDbRecordToDefinitionApiTask(
            { ...createdRawRecord, task_id: createdRawRecord.case_task_id },
            TaskOriginType.CASE
          )!;
        case "company":
          createdRawRecord = await createCompanyTaskDefinition(definitionPayload as Omit<CompanyTask, 'company_task_id' | 'origin_type' | 'created_at' | 'updated_at'>);
          return transformDbRecordToDefinitionApiTask(
            { ...createdRawRecord, task_id: createdRawRecord.company_task_id },
            TaskOriginType.COMPANY
          )!;
        default:
          const exhaustiveCheck: never = formType;
          throw new Error(`Invalid form type in mutation: ${exhaustiveCheck}`);
      }
    },
    onSuccess: (newDefinition, variables) => {
      queryClient.invalidateQueries({ queryKey: taskDefinitionKeys.lists(undefined, undefined, "all") });
      if (variables.formType) {
        queryClient.invalidateQueries({ queryKey: taskDefinitionKeys.lists(undefined, undefined, variables.formType) });
      }
      toast.success(`Task definition "${(newDefinition as any).task_name}" for ${variables.formType} created successfully.`);
    },
    onError: (error: any) => {
      console.error("Error creating task definition (hook):", error);
      toast.error(`Failed to create task definition: ${error.message}`);
    },
  });
};

export const getTaskDefinitionsCountByFilters = async (
  filters: TaskDefinitionFilter = {},
  fetchType: TaskOriginType | "all" = "all"
): Promise<number> => {
  try {
    const tableConfigs = [];
    if (fetchType === "all" || fetchType === TaskOriginType.PREDEFINED) tableConfigs.push({ table: "predefined_tasks", originType: TaskOriginType.PREDEFINED });
    if (fetchType === "all" || fetchType === TaskOriginType.CASE) tableConfigs.push({ table: "case_tasks", originType: TaskOriginType.CASE });
    if (fetchType === "all" || fetchType === TaskOriginType.COMPANY) tableConfigs.push({ table: "company_tasks", originType: TaskOriginType.COMPANY});

    let totalCount = 0;
    for (const config of tableConfigs) {
      let query = supabase.from(config.table).select("*", { count: "exact", head: true });
      if (filters.searchQuery) query = query.or(`task_name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      if (filters.priority !== undefined) {
        const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        if (priorities.length > 0) query = query.in("priority", priorities);
      }
      if (filters.task_category_id) query = query.eq("task_category_id", filters.task_category_id);
      if (filters.document_type_id) query = query.eq("document_type_id", filters.document_type_id);
      if (filters.service_id && config.originType === TaskOriginType.PREDEFINED) query = query.eq("service_id", filters.service_id);
      if (filters.case_id && config.originType === TaskOriginType.CASE) query = query.eq("case_id", filters.case_id);
      if (filters.company_id && config.originType === TaskOriginType.COMPANY) query = query.eq("company_id", filters.company_id);

      const { count, error } = await query;
      if (error) throw error;
      totalCount += count || 0;
    }
    return totalCount;
  } catch (error: any) {
    console.error("Error in getTaskDefinitionsCountByFilters:", error);
    throw new Error(`${error.message || "An unexpected error occurred"}. Contact support.`);
  }
};

export const useTaskDefinitionsCountQuery = (
  filters: TaskDefinitionFilter = {},
  fetchType: TaskOriginType | "all" = "all"
) => {
  return useQuery<number, Error>({
    queryKey: taskDefinitionKeys.lists(filters, undefined, fetchType).concat(["count"]),
    queryFn: () => getTaskDefinitionsCountByFilters(filters, fetchType),
  });
};