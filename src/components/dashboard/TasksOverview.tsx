import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { TaskOverviewGroup } from "@/types/dashboard";

interface TasksOverviewProps {
  tasks: TaskOverviewGroup[];
}

const TasksOverview: React.FC<TasksOverviewProps> = ({ tasks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tasks Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((group, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {group.categoryName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {group.completed}/{group.total}
                </span>
              </div>
              <Progress
                value={(group.completed / group.total) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex items-center">
            <div className="mr-2 text-green-500">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-2 text-amber-500">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">In Progress</p>
              <p className="text-xl font-bold">16</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-2 text-red-500">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">Overdue</p>
              <p className="text-xl font-bold">5</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksOverview;
