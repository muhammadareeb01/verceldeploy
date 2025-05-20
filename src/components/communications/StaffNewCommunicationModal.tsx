// Suggested file: src/components/communications/StaffNewCommunicationModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CommunicationType,
  ApiCase,
  ApiCompanySummary,
  Company,
} from "@/types/types";
import { ApiTask } from "@/types/tasks"; // Use correct types

interface StaffNewCommunicationModalProps {
  onSend: (
    // This signature matches the expected input for the mutation in the parent
    content: string,
    type: CommunicationType,
    relatedType: "general" | "case" | "company" | "task", // Added "company" and "task" based on schema
    relatedId?: string // company_id, case_id, or task_id
  ) => void;
  cases: ApiCase[];
  // Clients prop should align with the data fetched by companiesQuery
  companies: Company[]; // Changed from clients: Company[] to companies: ApiCompanySummary[]
  isLoading?: boolean;
  // Add a prop for tasks if staff can link communications to tasks
  tasks: ApiTask[];
}

const StaffNewCommunicationModal: React.FC<StaffNewCommunicationModalProps> = ({
  onSend,
  cases,
  companies,
  isLoading = false,
  tasks, // If adding task support
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [commType, setCommType] = useState<CommunicationType>(
    CommunicationType.ANNOUNCEMENT
  );
  const [relatedType, setRelatedType] = useState<
    "general" | "case" | "company" | "task"
  >("general"); // Added "company" and "task"
  const [relatedId, setRelatedId] = useState<string>(""); // Holds company_id, case_id, or task_id

  const handleSend = () => {
    if (!content.trim()) {
      // Content is required for any communication
      return;
    }

    // relatedId is only required if relatedType is NOT "general"
    if (relatedType !== "general" && !relatedId) {
      return;
    }

    // Pass the collected data to the parent's onSend handler
    onSend(
      content,
      commType,
      relatedType,
      // Pass relatedId only if a specific entity type is selected
      relatedType !== "general" ? relatedId : undefined
    );

    // Reset form state on successful send (or after parent handles it)
    setContent("");
    setRelatedId("");
    // Consider resetting commType and relatedType based on desired UX
    // setCommType("ANNOUNCEMENT");
    // setRelatedType("general");
    setOpen(false); // Close modal
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 " />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Communication</DialogTitle>
        </DialogHeader>
        <div className="space-y-10 h-[75vh]">
          <div>
            <Label className="mb-2 block font-bold my-6">Related To</Label>
            {/* Radio buttons for selecting the type of entity the communication relates to */}
            <RadioGroup
              value={relatedType}
              onValueChange={(value) => {
                setRelatedType(
                  value as "general" | "case" | "company" | "task"
                ); // Update type options
                setRelatedId(""); // Reset relatedId when changing type
              }}
              className="grid grid-cols-2 space-y-1"
            >
              <div className=" space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">Announcement</Label>
              </div>
              <div className="  space-x-2">
                <RadioGroupItem value="case" id="case" />
                <Label htmlFor="case">Case</Label>
              </div>
              <div className=" space-x-2">
                <RadioGroupItem value="company" id="company" />{" "}
                {/* Changed 'client' to 'company' */}
                <Label htmlFor="company">Company</Label>
              </div>
              {/* Add Task option if staff can link to tasks */}
              <div className="  space-x-2">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task">Task</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional rendering for selecting the specific entity */}
          {relatedType !== "general" && (
            <div>
              <Label htmlFor="related-entity" className="mb-2 block">
                Select{" "}
                {relatedType === "case"
                  ? "Case"
                  : relatedType === "company"
                  ? "Company"
                  : "Task"}{" "}
                {/* Update label */}
              </Label>
              <Select
                value={relatedId}
                onValueChange={setRelatedId}
                disabled={
                  (relatedType === "case" && cases.length === 0) ||
                  (relatedType === "company" && companies.length === 0) || // Use companies data
                  (relatedType === "task" && tasks.length === 0) // If adding task support
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${relatedType}`} />
                </SelectTrigger>
                <SelectContent>
                  {relatedType === "case" &&
                    cases.map((c) => (
                      <SelectItem key={c.case_id} value={c.case_id}>
                        {/* Display case identifier, e.g., Service Name + Case ID snippet */}
                        {`${
                          c.service?.service_name || "Unknown Service"
                        } - ${c.case_id.substring(0, 6)}`}
                      </SelectItem>
                    ))}
                  {relatedType === "company" &&
                    companies.map(
                      (
                        c // Use companies data
                      ) => (
                        // ApiCompanySummary has 'id' and 'name'
                        <SelectItem key={c.company_id} value={c.company_id}>
                          {c.name}
                        </SelectItem>
                      )
                    )}
                  {/* Render task options if adding task support */}
                  {relatedType === "task" &&
                    tasks.map((t) => (
                      <SelectItem key={t.task_id} value={t.task_id}>
                        {t.task_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="content" className="mb-2 block">
              Message
            </Label>
            <Textarea
              id="content"
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={
              !content.trim() || // Content is always required
              (relatedType !== "general" && !relatedId) || // relatedId is required if not general
              isLoading
            }
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffNewCommunicationModal;
