// src/components/TaskAssignmentForm.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface Profile {
  id: string;
  full_name: string;
}

export interface AssignTaskFormData {
  origin_task_type: "predefined" | "case" | "company";
  origin_task_id: string;
  status: string;
  assigned_to: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  description: string;
  priority: number;
  actual_duration_days: number | null;
}


interface TaskAssignmentFormProps {
  formData: AssignTaskFormData;
  onFormChange: (field: keyof AssignTaskFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  profiles: Profile[] | undefined;
  profilesLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
}

export const TaskAssignmentForm: React.FC<TaskAssignmentFormProps> = ({
  formData,
  onFormChange,
  onSubmit,
  profiles,
  profilesLoading,
  isSubmitting,
  onClose,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Origin Task Type (Read-only) */}
      <div>
        <Label htmlFor="origin_task_type" className="text-sm font-medium text-gray-700">Origin Task Type</Label>
        <Input
          id="origin_task_type"
          value={formData.origin_task_type}
          disabled
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
        />
      </div>

      {/* Origin ID (Read-only) */}
      <div>
        <Label htmlFor="origin_task_id" className="text-sm font-medium text-gray-700">Origin ID</Label>
        <Input
          id="origin_task_id"
          value={formData.origin_task_id}
          disabled
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
        />
      </div>

      {/* Status */}
      <div>
        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => onFormChange("status", value)}
        >
          <SelectTrigger className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOT_STARTED" className="hover:bg-gray-100">Not Started</SelectItem>
            <SelectItem value="IN_PROGRESS" className="hover:bg-gray-100">In Progress</SelectItem>
            <SelectItem value="COMPLETED" className="hover:bg-gray-100">Completed</SelectItem>
            <SelectItem value="BLOCKED" className="hover:bg-gray-100">Blocked</SelectItem>
            <SelectItem value="ON_HOLD" className="hover:bg-gray-100">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assigned To */}
      <div>
        <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">Assigned To</Label>
        <Select
          value={formData.assigned_to || undefined} // Ensure value is string or undefined for Select
          onValueChange={(value) => onFormChange("assigned_to", value)}
          disabled={profilesLoading}
        >
          <SelectTrigger className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <SelectValue placeholder={profilesLoading ? "Loading users..." : "Select a user"} />
          </SelectTrigger>
          <SelectContent>
            {profiles?.map((profile) => (
              <SelectItem key={profile.id} value={profile.id} className="hover:bg-gray-100">
                {profile.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div>
        <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date</Label>
        <Input
          id="start_date"
          type="date"
          value={formData.start_date || ""}
          onChange={(e) => onFormChange("start_date", e.target.value || null)}
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Due Date */}
      <div>
        <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date || ""}
          onChange={(e) => onFormChange("due_date", e.target.value || null)}
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Completed At */}
      <div>
        <Label htmlFor="completed_at" className="text-sm font-medium text-gray-700">Completed At (Optional)</Label>
        <Input
          id="completed_at"
          type="date"
          value={formData.completed_at || ""}
          onChange={(e) => onFormChange("completed_at", e.target.value || null)}
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Actual Duration Days */}
      <div>
        <Label htmlFor="actual_duration_days" className="text-sm font-medium text-gray-700">Actual Duration Days (Optional)</Label>
        <Input
          id="actual_duration_days"
          type="number"
          min={0}
          value={formData.actual_duration_days === null || formData.actual_duration_days === undefined ? "" : formData.actual_duration_days}
          onChange={(e) => onFormChange("actual_duration_days", e.target.value ? parseInt(e.target.value) : null)}
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange("description", e.target.value)}
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
        />
      </div>

      {/* Priority */}
      <div>
        <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority (0-5)</Label>
        <Input
          id="priority"
          type="number"
          min={0}
          max={5}
          value={formData.priority}
          onChange={(e) => onFormChange("priority", parseInt(e.target.value))}
          className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" type="button" onClick={onClose} className="border-gray-300 hover:bg-gray-50 text-gray-700">Cancel</Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Assign Task
        </Button>
      </div>
    </form>
  );
};