
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Package2,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSignOutMutation } from "@/hooks/useUsers";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const signOutMutation = useSignOutMutation();

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync();
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  // Define navigation items specifically for clients
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/client-dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Services",
      href: "/client-services",
      icon: <Package2 className="h-5 w-5" />,
    },
    {
      title: "My Cases",
      href: "/client-cases",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Communications",
      href: "/client-communications",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Check if current path is a case detail page
  const isCasePage = location.pathname.startsWith('/cases/');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r dark:border-gray-800 w-64">
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-center">
        <span className="font-semibold text-lg">Client Portal</span>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  (location.pathname === item.href || 
                   (item.href === "/client-cases" && isCasePage))
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
            {user?.user_metadata?.full_name || user?.email || "Client User"}
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

export default ClientSidebar;
