
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/types";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: Entering protected route...");
  console.log("ProtectedRoute: User:", user ? "present" : "null");
  console.log("ProtectedRoute: User Role:", userRole);
  console.log("ProtectedRoute: Is Loading:", isLoading);
  console.log("ProtectedRoute: Allowed Roles:", allowedRoles);

  // Show loading only during initial auth (no user yet)
  if (isLoading && !user) {
    console.log(
      "ProtectedRoute: Auth is loading (initial load), rendering loading indicator."
    );
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6 flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Loading authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && !user) {
    console.log(
      "ProtectedRoute: No user found (isLoading is false), redirecting to /portal."
    );
    toast.warning(
      "You need to log in to access this page. Contact Talha Khan at 442-421-5593 or info@dijitze.com for assistance."
    );
    return <Navigate to="/portal" state={{ from: location }} replace />;
  }

  if (!isLoading && user && allowedRoles && allowedRoles.length > 0) {
    console.log("ProtectedRoute: Checking user role against allowed roles.");
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(
        `ProtectedRoute: Role "${
          userRole || "none"
        }" not allowed for this route, redirecting.`
      );
      const redirectPath =
        userRole === "CLIENT" ? "/client-dashboard" : "/dashboard";
      console.error("Access denied", {
        description: `Your role (${
          userRole || "none"
        }) is not authorized for this page. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`,
      });
      return <Navigate to={redirectPath} replace />;
    }
    console.log(
      "ProtectedRoute: User authenticated and authorized based on role."
    );
  } else {
    console.log(
      "ProtectedRoute: No specific roles required, user is authenticated."
    );
  }

  console.log(
    "ProtectedRoute: User authenticated and authorized, rendering content."
  );
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
