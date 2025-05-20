import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Package2,
  CircuitBoard,
  MessageSquare,
  ScrollText, // Assuming this was for something like reports or logs
  ListChecks,
  Settings,
  LogOut,
  Tags,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSignOutMutation } from "@/hooks/useUsers";
import { toast } from "sonner";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  // Removed 'roles' property as filtering is now handled by routing/layout
};

const StaffSidebar = () => {
  // Renamed from Sidebar to StaffSidebar
  const navigate = useNavigate();

  const location = useLocation();
  const { user, userRole } = useAuth(); // Assuming useAuth provides user, userRole, and signOut
  const signOutMutation = useSignOutMutation();

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync();

      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Logout failed:", error);
      // Error handling is already managed by useSignOut's onError
    }
  };
  // Define navigation items specifically for staff roles
  // Role-based visibility within the sidebar itself is removed;
  // access control is handled by ProtectedRoute and the layout assignment in App.tsx
  const navItems: NavItem[] = [
    {
      title: "Dashboard", // Staff dashboard title
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Cases",
      href: "/cases",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Companies",
      href: "/companies",
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      title: "Service Categories",
      href: "/service-categories",
      icon: <Tags className="h-5 w-5" />,
    },
    {
      title: "Services",
      href: "/services",
      icon: <Package2 className="h-5 w-5" />,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: <CircuitBoard className="h-5 w-5" />,
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      title: "Task Categories",
      href: "/task-categories",
      icon: <Tags className="h-5 w-5" />,
    },
    {
      title: "Communications",
      href: "/communications",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Users", // Assuming this is for managing all users (staff and clients)
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Settings", // Assuming staff can access settings
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    // Add other staff-specific navigation items here
  ];

  // Removed the filtering logic within the sidebar component

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r dark:border-gray-800 w-64">
      {" "}
      {/* Fixed width for sidebar */}
      <div className="p-4 border-b dark:border-gray-800 flex items-center">
        <span className="font-semibold text-lg">Tabadl</span>
        <span className="text-xs ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
          {userRole || "Staff"} {/* Display user's specific role */}
        </span>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            // All items defined in navItems are displayed for staff
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">
            {user?.user_metadata?.full_name || user?.email || "Staff User"}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-gray-500 dark:text-gray-400"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default StaffSidebar; // Export as StaffSidebar
