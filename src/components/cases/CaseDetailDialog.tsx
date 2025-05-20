
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Clock, FileText, Edit, Trash2, 
  Users, Building, DollarSign, BarChart, AlertTriangle,
  CheckCircle, XCircle, Clock3, TimerReset
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { ApiCase, CaseStatus } from "@/types/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ApiTask } from "@/types/tasks";
import TaskItem from "@/components/tasks/TaskItem";

interface CaseDetailDialogProps {
  caseItem: ApiCase | null;
  relatedTasks?: ApiTask[];
  relatedDocumentsCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAll?: () => void;
}

const statusColors = {
  NOT_STARTED: "bg-gray-100 text-gray-700 border-gray-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  ON_HOLD: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const CaseDetailDialog: React.FC<CaseDetailDialogProps> = ({
  caseItem,
  relatedTasks = [],
  relatedDocumentsCount = 0,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onViewAll,
}) => {
  if (!caseItem) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Count tasks by status
  const taskStatusCounts = {
    total: relatedTasks.length,
    completed: relatedTasks.filter(task => task.status === 'COMPLETED').length,
    inProgress: relatedTasks.filter(task => task.status === 'IN_PROGRESS').length,
    notStarted: relatedTasks.filter(task => task.status === 'NOT_STARTED').length,
    blocked: relatedTasks.filter(task => 
      task.status === 'BLOCKED' || task.status === 'ON_HOLD'
    ).length
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!caseItem.target_date) return null;
    const today = new Date();
    const targetDate = new Date(caseItem.target_date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = calculateDaysRemaining();

  // Status badge with icon
  const getStatusBadge = (status: CaseStatus) => {
    let icon;
    switch (status) {
      case "IN_PROGRESS":
        icon = <Clock3 className="h-4 w-4 mr-1" />;
        break;
      case "COMPLETED":
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case "CANCELLED":
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      case "NOT_STARTED":
        icon = <TimerReset className="h-4 w-4 mr-1" />;
        break;
      case "ON_HOLD":
        icon = <AlertTriangle className="h-4 w-4 mr-1" />;
        break;
      default:
        icon = null;
    }
    
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs p-1 px-3 flex items-center",
          statusColors[status]
        )}
      >
        {icon}
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold">
              {caseItem.service?.service_name || "Case Details"}
            </DialogTitle>
            {getStatusBadge(caseItem.case_status)}
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {/* Client & Assignment Section */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                Client:{" "}
                <span className="font-medium">
                  {caseItem.company?.name || "Not assigned"}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                Assigned to:{" "}
                <span className="font-medium">
                  {caseItem.assignedUser?.full_name || "Unassigned"}
                </span>
              </span>
            </div>
            {caseItem.priority && (
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Priority: <span className="font-medium">{caseItem.priority}</span>
                </span>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="py-4 border-t border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Progress</h3>
              <span className="text-sm font-medium">{caseItem.progress_percent || 0}%</span>
            </div>
            <Progress value={caseItem.progress_percent || 0} className="h-2" />
          </div>
          
          {/* Dates & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                Start Date:{" "}
                <span className="font-medium">
                  {caseItem.start_date ? formatDate(caseItem.start_date) : "Not set"}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                Target Date:{" "}
                <span className="font-medium">
                  {caseItem.target_date ? formatDate(caseItem.target_date) : "Not set"}
                </span>
              </span>
            </div>
            {caseItem.actual_completion_date && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">
                  Completed:{" "}
                  <span className="font-medium">{formatDate(caseItem.actual_completion_date)}</span>
                </span>
              </div>
            )}
            
            {daysRemaining !== null && daysRemaining > 0 && caseItem.case_status !== 'COMPLETED' && (
              <div className="md:col-span-3">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  daysRemaining <= 3 ? "bg-red-50 text-red-600 border-red-200" : 
                  daysRemaining <= 7 ? "bg-yellow-50 text-yellow-600 border-yellow-200" : 
                  "bg-green-50 text-green-600 border-green-200"
                )}>
                  {daysRemaining} days remaining
                </Badge>
              </div>
            )}
          </div>

          {/* Budget Info */}
          {(caseItem.total_budget || caseItem.total_spent || caseItem.remaining_budget) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t">
              {caseItem.total_budget && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    Total Budget: <span className="font-medium">{formatCurrency(caseItem.total_budget)}</span>
                  </span>
                </div>
              )}
              {caseItem.total_spent && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    Total Spent: <span className="font-medium">{formatCurrency(caseItem.total_spent)}</span>
                  </span>
                </div>
              )}
              {caseItem.remaining_budget && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    Remaining: <span className="font-medium">{formatCurrency(caseItem.remaining_budget)}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {caseItem.notes && (
            <div className="animate-fade-in">
              <h3 className="text-base font-semibold mb-2">Notes</h3>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{caseItem.notes}</p>
              </div>
            </div>
          )}

          {/* Tasks Overview */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold">Tasks</h3>
              <div className="flex gap-2">
                <Badge variant="outline">Total: {taskStatusCounts.total}</Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Completed: {taskStatusCounts.completed}
                </Badge>
              </div>
            </div>
            
            {relatedTasks.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto p-1">
                {relatedTasks.slice(0, 3).map((task) => (
                  <TaskItem 
                    key={task.task_id} 
                    taskData={task} 
                    userData={task.assignedUser}
                    onClick={() => {}} // We'll handle this in the Tasks page
                  />
                ))}
                {relatedTasks.length > 3 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={onViewAll}
                  >
                    View all {relatedTasks.length} tasks...
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground border rounded-md">
                No tasks associated with this case
              </div>
            )}
          </div>

          {/* Documents Summary */}
          <div className="animate-fade-in">
            <h3 className="text-base font-semibold mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </h3>
            <Card className="bg-muted hover:bg-muted/80 transition-colors cursor-pointer" onClick={onViewAll}>
              <CardContent className="p-4 flex justify-between items-center">
                <span className="font-medium">{relatedDocumentsCount} document(s)</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {onEdit && (
              <Button variant="outline" className="gap-1" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" className="gap-1" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaseDetailDialog;
