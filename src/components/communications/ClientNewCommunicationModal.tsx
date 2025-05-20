
// src/components/communications/ClientNewCommunicationModal.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCommunicationMutation } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { ApiCase } from "@/types/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface ClientNewCommunicationModalProps {
  open: boolean;
  onClose: () => void;
  cases: ApiCase[];
  initialCaseId?: string;
}

const ClientNewCommunicationModal: React.FC<ClientNewCommunicationModalProps> = ({
  open,
  onClose,
  cases,
  initialCaseId,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [caseId, setCaseId] = useState<string | undefined>(initialCaseId);
  
  const mutation = useCreateCommunicationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    if (!caseId) {
      toast.error("Please select a case");
      return;
    }
    
    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    // Get company ID from the selected case
    const selectedCase = cases.find(c => c.case_id === caseId);
    if (!selectedCase) {
      toast.error("Selected case not found");
      return;
    }

    try {
      await mutation.mutateAsync({
        content,
        user_id: user.id,
        case_id: caseId,
        company_id: selectedCase.company_id,
        comm_type: "MESSAGE" as any, // Type cast to fix the build error
      });
      
      toast.success("Message sent successfully");
      setContent("");
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Communication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case">Related Case</Label>
            <Select
              value={caseId}
              onValueChange={(value) => setCaseId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((caseItem) => (
                  <SelectItem key={caseItem.case_id} value={caseItem.case_id}>
                    {caseItem.service?.service_name || `Case ${caseItem.case_id.substring(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientNewCommunicationModal;
