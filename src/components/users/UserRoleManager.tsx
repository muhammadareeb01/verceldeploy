import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserRole } from "@/types/types";
import { updateUserRole, hasPermission } from "@/api/users";

interface UserRoleManagerProps {
  userId: string;
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  disabled?: boolean;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  userId,
  currentRole,
  onRoleChange,
  disabled = false,
}) => {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canChangeRoles, setCanChangeRoles] = useState(false);

  useEffect(() => {
    // Check if the user has permission to change roles
    hasPermission("change_roles").then(setCanChangeRoles);
  }, []);

  const handleRoleChange = async () => {
    if (role === currentRole) return;

    setIsUpdating(true);
    try {
      const success = await updateUserRole(userId, role);

      if (success) {
        onRoleChange(role);
        toast.success("User role updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
      // Reset to the current role on failure
      setRole(currentRole);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role}
        onValueChange={(value) => setRole(value as UserRole)}
        disabled={disabled || isUpdating || !canChangeRoles}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="MANAGER">Manager</SelectItem>
          <SelectItem value="OFFICER">Officer</SelectItem>
          <SelectItem value="STAFF">Staff</SelectItem>
          <SelectItem value="CLIENT">Client</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRoleChange}
        disabled={
          disabled || isUpdating || role === currentRole || !canChangeRoles
        }
      >
        {isUpdating ? "Updating..." : "Update"}
      </Button>
    </div>
  );
};

export default UserRoleManager;
