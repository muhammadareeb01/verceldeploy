import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "sonner";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import StaffLayout from "./components/layout/StaffLayout";
import ClientLayout from "./components/layout/ClientLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import StaffLogin from "./pages/StaffLogin";
import ClientLogin from "./pages/ClientLogin";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Cases from "./pages/Cases";
import Tasks from "./pages/Tasks";
import CaseDetail from "./pages/CaseDetail";
import ClientDashboard from "./pages/Client/ClientDashboard";
import Communications from "./pages/Communications";
import ClientCommunications from "./pages/Client/ClientCommunications";
import Services from "./pages/Services";
import ServiceCategories from "./pages/ServiceCategories";
import ResetPassword from "./pages/ResetPassword";
import Documents from "./pages/Documents";
import Users from "./pages/Users";
import ClientManagement from "./pages/ClientManagement";
import StaffManagement from "./pages/StaffManagement";
import ClientOnboarding from "./pages/ClientOnboarding";
import TaskCategories from "./pages/TaskCategories";
import Settings from "./pages/Settings";
import { UserRole } from "@/types/types";
import ClientServices from "./pages/Client/ClientServices";
import ClientCases from "./pages/Client/ClientCases";
import ClientCheckout from "./pages/Client/ClientCheckout";
import TaskAssignmentPage from "./pages/TaskAssignmentPage";

// Centralized route configuration
const appRoutes = [
  { path: "/", element: <Landing />, public: true },
  { path: "/staff-login", element: <StaffLogin />, public: true },
  { path: "/portal", element: <ClientLogin />, public: true },
  { path: "/reset-password", element: <ResetPassword />, public: true },

  // Client Routes (protected)
  {
    path: "/client-dashboard",
    element: <ClientDashboard />,
    layout: ClientLayout, // Use ClientLayout for client dashboard
    protected: true,
    allowedRoles: ["CLIENT"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/onboarding",
    element: <ClientOnboarding />,
    layout: ClientLayout, // Use ClientLayout for onboarding
    protected: true,
    allowedRoles: ["CLIENT"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  // Add other client-specific protected routes here and use ClientLayout
  {
    path: "/client-services",
    element: <ClientServices />,
    layout: ClientLayout,
    protected: true,
    allowedRoles: ["CLIENT"] as UserRole[],
  },
  {
    path: "/client-checkout",
    element: <ClientCheckout />,
    layout: ClientLayout,
    protected: true,
    allowedRoles: ["CLIENT"] as UserRole[],
  },
  {
    path: "/client-communications",
    element: <ClientCommunications />,
    layout: ClientLayout,
    protected: true,
    allowedRoles: ["CLIENT"] as UserRole[],
  },
  {
    path: "/client-cases",
    element: <ClientCases />,
    layout: ClientLayout,
    protected: true,
    allowedRoles: ["CLIENT"] as UserRole[],
  },
  // Staff/Admin Routes (protected)
  {
    path: "/dashboard",
    element: <Dashboard />, // This is the Staff Dashboard
    layout: StaffLayout, // Use StaffLayout for staff dashboard
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER", "STAFF"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/cases",
    element: <Cases />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/cases/:id",
    element: <CaseDetail />,
    // Use layout based on user role - this will be determined in the ProtectedRoute component
    layout: null, // We'll handle layout selection in the ProtectedRoute component
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER", "CLIENT"] as UserRole[],
  },
  {
    path: "/clients",
    element: <ClientManagement />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/companies",
    element: <Companies />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/companies/:id",
    element: <CompanyDetail />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/service-categories",
    element: <ServiceCategories />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/services",
    element: <Services />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/documents",
    element: <Documents />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/tasks",
    element: <Tasks />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/task-categories",
    element: <TaskCategories />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },


  {
    path: "/task/:id",
    element: <TaskAssignmentPage />,
    layout: StaffLayout,
    protected: true,
    allowedRoles: ["ADMIN"] as UserRole[],
  },
  {
    path: "/communications",
    element: <Communications />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/users",
    element: <Users />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/staff",
    element: <StaffManagement />,
    layout: StaffLayout, // Use StaffLayout
    protected: true,
    allowedRoles: ["ADMIN"] as UserRole[], // Corrected: Cast array to UserRole[]
  },
  {
    path: "/settings",
    element: <Settings />,
    layout: StaffLayout, // Assuming settings is a staff-only page
    protected: true,
    // If settings can be accessed by any authenticated user (staff or client),
    // you might need a different approach or a shared layout,
    // but for now, assuming it's staff-only and uses StaffLayout.
    allowedRoles: ["ADMIN", "MANAGER", "OFFICER", "STAFF"] as UserRole[], // Corrected: Cast array to UserRole[]
  },

  // Catch-all for 404
  // Note: ProtectedRoute on other routes should prevent unauthenticated users
  // from hitting protected 404s.
  { path: "*", element: <NotFound />, public: true },
];

function App() {
  return (
    <Routes>
      {appRoutes.map((route, index) => {
        const RouteElement = route.element;
        
        // For routes that need dynamic layout selection based on user role
        if (route.path === "/cases/:id") {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={route.allowedRoles}>
                  <DynamicLayout>{RouteElement}</DynamicLayout>
                </ProtectedRoute>
              }
            />
          );
        }
        
        // For all other routes
        const Layout = route.layout || React.Fragment;

        if (route.protected) {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={route.allowedRoles}>
                  <Layout>{RouteElement}</Layout>
                </ProtectedRoute>
              }
            />
          );
        } else {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Layout>{RouteElement}</Layout>}
            />
          );
        }
      })}
    </Routes>
  );
}

// Create DynamicLayout component to choose layout based on user role
const DynamicLayout = ({ children }: { children: React.ReactNode }) => {
  const { userRole } = useAuth();
  
  if (userRole === "CLIENT") {
    return <ClientLayout>{children}</ClientLayout>;
  } else {
    return <StaffLayout>{children}</StaffLayout>;
  }
};

export default App;
