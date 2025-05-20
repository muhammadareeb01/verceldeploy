import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  UserPlus,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

// Types
import { ApiTask, TaskOriginType } from "@/types/tasks";

// Assuming these are the correct types and hooks for case_tasks
import { transformDbRecordToDefinitionApiTask } from "@/hooks/useTasks";

interface CaseTasksSectionProps {
  caseId: string;
}

const CaseTasksSection: React.FC<CaseTasksSectionProps> = ({ caseId }) => {
  // Custom query to fetch case_tasks based on case_id with console logs
  const {
    data: caseTasks = [],
    isLoading,
    error,
  } = useQuery<ApiTask[], Error>({
    queryKey: ["caseTasks", caseId],
    queryFn: async () => {
      console.log(`Fetching case_tasks for caseId: ${caseId}`);
      const { data, error } = await supabase
        .from("case_tasks")
        .select("task_id:case_task_id, task_name, description, task_category_id, document_type_id, priority, created_at, updated_at, case_id")
        .eq("case_id", caseId);

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Raw data from Supabase:", data);

      const transformedTasks = data.map((record) =>
        transformDbRecordToDefinitionApiTask(record, TaskOriginType.CASE)
      );
      console.log("Transformed tasks before filtering:", transformedTasks);

      const filteredTasks = transformedTasks.filter((task): task is ApiTask => task !== null);
      console.log("Filtered tasks after removing nulls:", filteredTasks);

      return filteredTasks;
    },
    enabled: !!caseId,
  });

  if (error) {
    console.error("Query error:", error.message);
    return (
      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent><div className="text-red-600">Error loading tasks: {error.message}</div></CardContent>
      </Card>
    );
  }

  if (isLoading) {
    console.log("Loading state is true");
    return (
      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent><div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CardContent>
      </Card>
    );
  }

  console.log("Final caseTasks data rendered:", caseTasks);

  // Placeholder function for the "Assigned To" button
  const handleAssignClick = (task: ApiTask) => {
    console.log(`Assign button clicked for task: ${task.task_name} (case_task_id: ${task.case_task_id})`);
    // Further implementation to be provided later
  };

  const getStatusBadge = (status?: string | null) => {
    return status ? (
      <Badge variant="default"><CheckCircle className="h-4 w-4 mr-1" />{status.replace(/_/g, " ")}</Badge>
    ) : (
      <Badge variant="outline"><XCircle className="h-4 w-4 mr-1" />Pending</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tasks ({caseTasks.length})</CardTitle>
          <Button asChild size="sm">
            <Link to={`/cases/${caseId}/tasks/new`}>Add Task</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {caseTasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseTasks.map((task) => (
                <TableRow key={task.case_task_id}>
                  <TableCell className="font-medium">{task.task_name}</TableCell>
                  <TableCell>{task.description || "N/A"}</TableCell>
                  <TableCell>{task.priority || 0}</TableCell>
                  <TableCell>
                    {task.created_at
                      ? format(new Date(task.created_at), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignClick(task)}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Assigned To
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No tasks assigned to this case yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CaseTasksSection;