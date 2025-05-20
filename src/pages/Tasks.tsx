import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { PlusCircle, Filter, ListFilter } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import TaskList from "@/components/tasks/TaskList";
import TaskFormDialog, { TaskDefinitionFormData as FormDialogTaskDefinitionFormData } from "@/components/tasks/TaskFormDialog";
import TaskFilterBar from "@/components/tasks/TaskFilterBar";
import TaskDetailDialog from "@/components/tasks/TaskDetailDialog";

import {
  ApiTask,
  TaskOriginType,
  UserRole,
  PredefinedTask,
  CaseTask,
  CompanyTask,
  TaskDefinitionCreateInput,
  TaskDefinitionFormData,
} from "@/types/tasks";
import {
  useTaskDefinitionsQuery,
  useCreateTaskDefinitionMutation,
  taskDefinitionKeys,
  useTaskDefinitionsCountQuery,
} from "@/hooks/useTasks";

import { toast } from "sonner";
// import { formatDate } from "@/utils/formatters"; // Uncomment if used

// Types for dropdown data
interface Service { service_id: string; service_name: string; }
interface CaseDataType {
  case_id: string;
  company_id: string;
  service_id?: string | null;
  notes?: string | null;
  case_title: string;
}
interface DocumentType { doc_type_id: string; doc_type_name: string; }
interface Company { company_id: string; name: string; } // Ensure 'name' is the correct field for company name
interface UserDetail { id: string; full_name: string; role: UserRole | string; avatar_url?: string; }
interface TaskCategory { category_id: string; category_name: string; }

const getSpecificIdFromApiTask = (task: ApiTask): string => {
  switch (task.origin_type) {
    case TaskOriginType.PREDEFINED: return task.predefined_task_id;
    case TaskOriginType.CASE: return task.case_task_id;
    case TaskOriginType.COMPANY: return task.company_task_id;
    default:
      const _exhaustiveCheck: never = task;
      console.error("Unknown task type in getSpecificIdFromApiTask", _exhaustiveCheck);
      return "";
  }
};

const transformDbRecordToDefinitionApiTask = (dbRecord: any, originType: TaskOriginType): ApiTask | null => {
  if (!dbRecord) return null;
  const specificId = dbRecord.task_id;
  if (!specificId) {
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

const Tasks: React.FC = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTypeTab, setSelectedTypeTab] = useState<TaskOriginType | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<"predefined" | "case" | "company" | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [taskFilter, setTaskFilter] = useState<{
    searchQuery?: string;
    service_id?: string;
    case_id?: string;
    company_id?: string;
    task_category_id?: string;
    priority?: number[] | number;
    document_type_id?: string;
  }>({});

  const [taskSort, setTaskSort] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "created_at",
    direction: "desc",
  });

  const debouncedSetSearchFilter = useCallback(
    debounce((query: string) => {
      setTaskFilter((prev) => ({ ...prev, searchQuery: query || undefined }));
    }, 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearchFilter.cancel();
  }, [debouncedSetSearchFilter]);

  const { data: categories = [] } = useQuery<TaskCategory[]>({ queryKey: ["taskCategoriesForFilter"], queryFn: async () => { const { data, error } = await supabase.from("task_categories").select("category_id, category_name"); if (error) throw error; return data || []; }});
  const { data: users = [] } = useQuery<UserDetail[]>({ queryKey: ["profilesForTaskAssignment"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("id, full_name, role, avatar_url").order("full_name", { ascending: true }); if (error) { console.error("Error fetching profiles:", error); throw error; } return data || []; }});
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({ queryKey: ["companiesForTaskForm"], queryFn: async () => { const { data, error } = await supabase.from("companies").select("company_id, name").order("name", { ascending: true }); if (error) { console.error("Error fetching companies:", error); throw error; } return data || []; }});
  const { data: cases = [] } = useQuery<CaseDataType[]>({ queryKey: ["casesForTaskForm"], queryFn: async () => { const { data, error } = await supabase.from("cases").select("case_id, company_id, service_id, notes"); if (error) { console.error("Error fetching cases:", error); throw error; } return (data || []).map(c => ({...c, case_title: c.notes || `Case ${c.case_id.substring(0, 8)}`})); }});
  const { data: services = [], isLoading: isLoadingServices } = useQuery<Service[]>({ queryKey: ["servicesForTaskForm"], queryFn: async () => { const { data, error } = await supabase.from("services").select("service_id, service_name").order("service_name", { ascending: true }); if (error) { console.error("Error fetching services:", error); throw error; } return data || []; }});
  const { data: documentTypes = [] } = useQuery<DocumentType[]>({ queryKey: ["documentTypesForTaskForm"], queryFn: async () => { const { data, error } = await supabase.from("document_types").select("doc_type_id, doc_type_name"); if (error) { console.error("Error fetching document types:", error); throw error; } return data || []; }});

  const { data: tasks = [], isLoading: isLoadingTasks, isError: isTasksError, error: tasksApiError } = useTaskDefinitionsQuery(taskFilter, taskSort, selectedTypeTab);
  const { data: allTasksGlobalCount = 0, isLoading: isLoadingAllCount } = useTaskDefinitionsCountQuery(taskFilter, "all");
  const { data: predefinedTasksGlobalCount = 0, isLoading: isLoadingPredefinedCount } = useTaskDefinitionsCountQuery(taskFilter, TaskOriginType.PREDEFINED);
  const { data: caseTasksGlobalCount = 0, isLoading: isLoadingCaseCount } = useTaskDefinitionsCountQuery(taskFilter, TaskOriginType.CASE);
  const { data: companyTasksGlobalCount = 0, isLoading: isLoadingCompanyCount } = useTaskDefinitionsCountQuery(taskFilter, TaskOriginType.COMPANY);

  const createTaskDefinitionMutation = useCreateTaskDefinitionMutation();
  const updateTaskMutation = useMutation({ mutationFn: async (payload: { taskToUpdate: ApiTask; updates: Partial<ApiTask>; }) => { const { taskToUpdate, updates } = payload; let tableName: string, idColumn: string, specificIdToUpdate: string; let dbUpdateData: { [key: string]: any } = { ...updates }; delete dbUpdateData.created_at; delete dbUpdateData.updated_at; delete (dbUpdateData as any).predefined_task_id; delete (dbUpdateData as any).case_task_id; delete (dbUpdateData as any).company_task_id; delete (dbUpdateData as any).task_id; delete (dbUpdateData as any).origin_type; switch (taskToUpdate.origin_type) { case TaskOriginType.PREDEFINED: tableName = "predefined_tasks"; idColumn = "predefined_task_id"; specificIdToUpdate = taskToUpdate.predefined_task_id; if (dbUpdateData.default_responsible_user_role !== undefined) { dbUpdateData.default_responsible_role = dbUpdateData.default_responsible_user_role; delete dbUpdateData.default_responsible_user_role; } delete dbUpdateData.case_id; delete dbUpdateData.company_id; break; case TaskOriginType.CASE: tableName = "case_tasks"; idColumn = "case_task_id"; specificIdToUpdate = taskToUpdate.case_task_id; delete dbUpdateData.service_id; delete dbUpdateData.default_responsible_role; delete dbUpdateData.default_responsible_user_role; delete dbUpdateData.typical_duration_days; delete dbUpdateData.company_id; break; case TaskOriginType.COMPANY: tableName = "company_tasks"; idColumn = "company_task_id"; specificIdToUpdate = taskToUpdate.company_task_id; delete dbUpdateData.service_id; delete dbUpdateData.default_responsible_role; delete dbUpdateData.default_responsible_user_role; delete dbUpdateData.typical_duration_days; delete dbUpdateData.case_id; break; default: const _exhaustiveCheck: never = taskToUpdate; throw new Error(`Invalid origin type: ${(_exhaustiveCheck as ApiTask).origin_type}`); } Object.keys(dbUpdateData).forEach(key => dbUpdateData[key] === undefined && delete dbUpdateData[key]); if (Object.keys(dbUpdateData).length === 0) { toast.info("No changes detected."); return taskToUpdate; } const { data: updatedRecordFromDb, error } = await supabase.from(tableName).update(dbUpdateData).eq(idColumn, specificIdToUpdate).select().single(); if (error) throw error; return transformDbRecordToDefinitionApiTask({ ...updatedRecordFromDb, task_id: specificIdToUpdate }, taskToUpdate.origin_type); }, onSuccess: (updatedApiTask) => { if (updatedApiTask) { queryClient.invalidateQueries({ queryKey: taskDefinitionKeys.lists(undefined, undefined, "all") }); queryClient.invalidateQueries({ queryKey: taskDefinitionKeys.lists(undefined, undefined, updatedApiTask.origin_type) }); if (selectedTask && getSpecificIdFromApiTask(selectedTask) === getSpecificIdFromApiTask(updatedApiTask)) { setSelectedTask(updatedApiTask); } toast.success("Task updated successfully!"); } setIsEditMode(false); }, onError: (error: any) => { console.error("Update Task Error:", error); toast.error(`Failed to update task: ${error.message || "Unknown error"}`); }, });
  const deleteTaskMutation = useMutation({ mutationFn: async (taskToDelete: ApiTask) => { let tableName: string; let idColumn: string; let specificIdToDelete: string; switch (taskToDelete.origin_type) { case TaskOriginType.PREDEFINED: tableName = "predefined_tasks"; idColumn = "predefined_task_id"; specificIdToDelete = taskToDelete.predefined_task_id; break; case TaskOriginType.CASE: tableName = "case_tasks"; idColumn = "case_task_id"; specificIdToDelete = taskToDelete.case_task_id; break; case TaskOriginType.COMPANY: tableName = "company_tasks"; idColumn = "company_task_id"; specificIdToDelete = taskToDelete.company_task_id; break; default: const _exhaustiveCheck: never = taskToDelete; throw new Error(`Invalid origin type: ${(_exhaustiveCheck as ApiTask).origin_type}`); } const { error } = await supabase.from(tableName).delete().eq(idColumn, specificIdToDelete); if (error) throw error; }, onSuccess: (_, deletedTask) => { queryClient.invalidateQueries({ queryKey: taskDefinitionKeys.lists(undefined, undefined, "all") }); if (deletedTask && (deletedTask as ApiTask).origin_type) { queryClient.invalidateQueries({ queryKey: taskDefinitionKeys.lists(undefined, undefined, (deletedTask as ApiTask).origin_type) }); } toast.success("Task deleted successfully"); setIsDetailModalOpen(false); setSelectedTask(null); }, onError: (error: any) => { console.error("Delete Task Error:", error); toast.error(`Failed to delete task: ${error.message}`); }, });

  const handleOpenCreateDialog = (type: "predefined" | "case" | "company") => setSelectedFormType(type);
  const handleCloseCreateDialog = () => setSelectedFormType(null);
  const handleCreateTaskDefinition = (formDataFromDialog: FormDialogTaskDefinitionFormData) => { if (!selectedFormType) { toast.error("Form type not specified."); return; } const mutationInput: TaskDefinitionCreateInput = { formType: selectedFormType, ...formDataFromDialog } as TaskDefinitionCreateInput; createTaskDefinitionMutation.mutate(mutationInput, { onSuccess: (createdTask) => { toast.success(`Task for ${createdTask.origin_type.toLowerCase()} "${createdTask.task_name}" created.`); handleCloseCreateDialog(); }, onError: (error) => { toast.error(`Failed to create task: ${error.message}`); }, }); };
  const handleTaskClick = (task: ApiTask) => { setSelectedTask(task); setIsEditMode(false); setIsDetailModalOpen(true); };
  const handleEditTaskTrigger = () => setIsEditMode(true);
  const handleUpdateTask = (updatedFormDataFromDialog: Partial<ApiTask>) => { if (selectedTask) { updateTaskMutation.mutate({ taskToUpdate: selectedTask, updates: updatedFormDataFromDialog }); } else { toast.error("No task selected for update."); }};
  const handleDeleteTask = (task: ApiTask) => deleteTaskMutation.mutate(task);
  const handleFilterChange = (newFilters: Partial<typeof taskFilter>) => setTaskFilter(prev => ({ ...prev, ...newFilters }));
  const handleSortChange = (newSort: { field: string; direction: "asc" | "desc" }) => setTaskSort(newSort);
  const handleSearchChange = (query: string) => debouncedSetSearchFilter(query);
  const handleClearFilters = () => {
    const currentSearchQuery = taskFilter.searchQuery;
    setTaskFilter({
      searchQuery: currentSearchQuery || undefined,
      service_id: undefined,
      case_id: undefined,
      company_id: undefined, // Ensure company_id is cleared
      task_category_id: undefined,
      priority: undefined,
      document_type_id: undefined,
    });
    setTaskSort({ field: "created_at", direction: "desc" });
  };
  const handleServiceFilterDropdownChange = (serviceId: string | undefined) => {
    setTaskFilter(prev => ({
      ...prev,
      service_id: serviceId,
    }));
  };
  const handleCompanyFilterDropdownChange = (companyId: string | undefined) => {
    setTaskFilter(prev => ({
      ...prev,
      company_id: companyId,
    }));
  };
  const renderBadgeCount = (count: number, isLoading: boolean) => isLoading ? "..." : count;

  if (isTasksError && tasksApiError) { return ( <div className="container mx-auto p-4"> <h1 className="text-2xl font-bold text-red-600">Error</h1> <p className="text-muted-foreground">{tasksApiError.message || "Failed to load tasks."}</p> </div> ); }

  const selectedServiceName = taskFilter.service_id ? services.find(s => s.service_id === taskFilter.service_id)?.service_name : null;
  const selectedCompanyName = taskFilter.company_id ? companies.find(c => c.company_id === taskFilter.company_id)?.name : null;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-left">Task Definitions</h1><p className="text-muted-foreground">Manage task definitions for services, cases, and companies.</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-1"><Filter className="h-4 w-4" />{isFilterOpen ? "Hide Filters" : "Show Filters"}</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button className="flex items-center gap-1"><PlusCircle className="h-4 w-4" /> New Task Definition</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleOpenCreateDialog("predefined")}>Predefined Task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenCreateDialog("case")}>Case Specific Task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenCreateDialog("company")}>Company Specific Task</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isFilterOpen && (
        <TaskFilterBar
          filters={taskFilter}
          sortOption={taskSort}
          onClearFilters={handleClearFilters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
          searchQuery={taskFilter.searchQuery || ""}
          companies={companies}
          cases={cases}
          categories={categories}
          services={services}
          documentTypes={documentTypes}
          isLoadingData={isLoadingTasks}
        />
      )}

      <div className="mt-6">
        <Tabs value={selectedTypeTab} onValueChange={(value) => setSelectedTypeTab(value as TaskOriginType | "all")} className="w-full">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-1">All <Badge variant="secondary">{renderBadgeCount(allTasksGlobalCount, isLoadingAllCount)}</Badge></TabsTrigger>
            <TabsTrigger value={TaskOriginType.PREDEFINED} className="flex items-center gap-1">Predefined <Badge variant="secondary">{renderBadgeCount(predefinedTasksGlobalCount, isLoadingPredefinedCount)}</Badge></TabsTrigger>
            <TabsTrigger value={TaskOriginType.CASE} className="flex items-center gap-1">Case <Badge variant="secondary">{renderBadgeCount(caseTasksGlobalCount, isLoadingCaseCount)}</Badge></TabsTrigger>
            <TabsTrigger value={TaskOriginType.COMPANY} className="flex items-center gap-1">Company <Badge variant="secondary">{renderBadgeCount(companyTasksGlobalCount, isLoadingCompanyCount)}</Badge></TabsTrigger>
          </TabsList>

          {(["all", TaskOriginType.PREDEFINED, TaskOriginType.CASE, TaskOriginType.COMPANY] as const).map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-4">
              {selectedTypeTab === tabValue && (
                <>
                  {tabValue === TaskOriginType.PREDEFINED && (
                    <div className="flex justify-end mb-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1 min-w-[150px] justify-start">
                            <ListFilter className="h-4 w-4" />
                            <span className="truncate">
                              {selectedServiceName ? `Service: ${selectedServiceName}` : "Filter by Service"}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                          <DropdownMenuItem onClick={() => handleServiceFilterDropdownChange(undefined)}>
                            All Services
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {isLoadingServices ? (
                            <DropdownMenuItem disabled>Loading services...</DropdownMenuItem>
                          ) : (
                            services.map((service) => (
                              <DropdownMenuItem
                                key={service.service_id}
                                onClick={() => handleServiceFilterDropdownChange(service.service_id)}
                                disabled={taskFilter.service_id === service.service_id}
                              >
                                {service.service_name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  {tabValue === TaskOriginType.COMPANY && (
                    <div className="flex justify-end mb-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1 min-w-[150px] justify-start">
                            <ListFilter className="h-4 w-4" />
                            <span className="truncate">
                              {selectedCompanyName ? `Company: ${selectedCompanyName}` : "Filter by Company"}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                          <DropdownMenuItem onClick={() => handleCompanyFilterDropdownChange(undefined)}>
                            All Companies
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {isLoadingCompanies ? (
                            <DropdownMenuItem disabled>Loading companies...</DropdownMenuItem>
                          ) : (
                            companies.map((company) => (
                              <DropdownMenuItem
                                key={company.company_id}
                                onClick={() => handleCompanyFilterDropdownChange(company.company_id)}
                                disabled={taskFilter.company_id === company.company_id}
                              >
                                {company.name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <TaskList
                    tasks={tasks}
                    isLoadingTasks={isLoadingTasks}
                    selectedTab={selectedTypeTab}
                    onTaskClick={handleTaskClick}
                    onStatusChange={() => toast.info("Status change not for definitions.")}
                  />
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {selectedFormType && <TaskFormDialog open={!!selectedFormType} onOpenChange={(open) => { if (!open) handleCloseCreateDialog(); }} mode="create" formType={selectedFormType} categories={categories} clients={companies} cases={cases} services={services} documentTypes={documentTypes} usersForAssignment={users} userRole={userRole || UserRole.STAFF} initialData={{}} onSubmit={handleCreateTaskDefinition} isMutating={createTaskDefinitionMutation.isPending} isLoading={createTaskDefinitionMutation.isPending} mutationError={createTaskDefinitionMutation.error as Error | null} />}
      {selectedTask && isDetailModalOpen && <TaskDetailDialog open={isDetailModalOpen} onOpenChange={(open) => { if (!open) { setSelectedTask(null); setIsEditMode(false); } setIsDetailModalOpen(open); }} task={selectedTask} isEditMode={isEditMode} onEdit={handleEditTaskTrigger} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} servicesList={services} casesList={cases} taskCategoriesList={categories} documentTypesList={documentTypes} userRolesList={Object.values(UserRole).map(role => ({ value: role, label: role.replace(/_/g, ' ') }))} companies={companies} />}
    </div>
  );
};

export default Tasks;