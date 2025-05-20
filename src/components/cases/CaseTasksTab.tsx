import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TaskItem from "@/components/tasks/TaskItem";
import { ApiTask } from "@/types/tasks";

interface CaseTasksTabProps {
  tasks: ApiTask[];
}

const CaseTasksTab: React.FC<CaseTasksTabProps> = ({ tasks }) => {
  // Group tasks by status
  const groupTasksByStatus = () => {
    const grouped: Record<string, ApiTask[]> = {
      NOT_STARTED: [],
      IN_PROGRESS: [],
      COMPLETED: [],
      BLOCKED: [],
      ON_HOLD: [],
    };

    tasks.forEach((task) => {
      const status = task.status || "NOT_STARTED";
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
    });

    return grouped;
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">No tasks found for this case.</p>
          <Button className="mt-4" variant="outline">
            Create Task
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
        <Button variant="outline">Add Task</Button>
      </div>
      {Object.entries(groupTasksByStatus()).map(
        ([status, statusTasks]) =>
          statusTasks.length > 0 && (
            <div key={status} className="space-y-2">
              <h4 className="text-sm font-medium">
                {status.replace(/_/g, " ")} ({statusTasks.length})
              </h4>
              {statusTasks.map((task) => (
                <TaskItem
                  key={task.task_id}
                  taskData={task}
                  userData={task.assignedUser}
                />
              ))}
            </div>
          )
      )}
    </div>
  );
};

export default CaseTasksTab;
