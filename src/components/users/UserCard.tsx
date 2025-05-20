import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, UserCircle, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/types";

interface UserCardProps {
  user: UserProfile;
  onClick?: () => void;
  onActionClick?: () => void; // for the 3-dot menu
}

const getRoleBadgeColor = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMIN:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    OFFICER:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    STAFF: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CLIENT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    roleMap[role] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  );
};

const UserCard: React.FC<UserCardProps> = ({
  user,

  onClick,
  onActionClick,
}) => {
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "";

  const formattedRole = user.role.replace(/_/g, " ");

  return (
    <Card
      className={cn(
        "w-full transition-all duration-200 ease-in-out",
        onClick && "cursor-pointer hover:shadow-md dark:hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${name}'s avatar`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg font-medium">
              {initials || <UserCircle className="h-6 w-6" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top: Name and Action */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg truncate">
              {user.full_name || "Unnamed User"}
            </h3>
            {onActionClick && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick?.();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Middle: Badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge
              className={cn(
                "text-xs font-normal",
                getRoleBadgeColor(user.role)
              )}
            >
              {formattedRole}
            </Badge>
            <Badge
              className={cn(
                "text-xs font-normal border",
                user.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
              )}
            >
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Bottom: Contact Info */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 text-sm text-muted-foreground mt-2">
            <div className="flex items-center truncate">
              <Mail size={14} className="mr-1 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center truncate">
                <Phone size={14} className="mr-1 shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
