import React, { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthCard from "@/components/auth/AuthCard";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useSignInMutation, useSignUpMutation } from "@/hooks/useUsers";
import { User } from "lucide-react";
import { UserRole } from "@/types/types";

const ClientLogin = () => {
  const [searchParams] = useSearchParams();
  const { user, userRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "signin"
  );
  const [isNewSignup, setIsNewSignup] = useState(false);

  const {
    mutate: signIn,
    isPending: isSignInLoading,
    error: signInError,
  } = useSignInMutation();
  const {
    mutate: signUp,
    isPending: isSignUpLoading,
    error: signUpError,
  } = useSignUpMutation();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "signin" || tab === "signup")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && userRole && !isLoading) {
      console.log("ClientLogin: User authenticated, role:", userRole);
      if (isNewSignup) {
        console.log("New signup detected, redirecting to /onboarding");
        setIsNewSignup(false);
      }
    }
  }, [user, userRole, isLoading, isNewSignup]);

  const handleSignIn = async (email: string, password: string) => {
    signIn(
      { email, password },
      {
        onSuccess: () => {
          console.log("ClientLogin: Sign-in successful");
        },
      }
    );
  };

  const handleSignUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    signUp(
      { email, password, fullName, phone, role: UserRole.CLIENT },
      {
        onSuccess: () => {
          console.log("ClientLogin: Sign-up successful");
          setIsNewSignup(true);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (user && userRole) {
    if (isNewSignup) {
      console.log("Rendering Navigate to /onboarding");
      return <Navigate to="/onboarding" replace />;
    }
    console.log("Rendering Navigate to /client-dashboard");
    return <Navigate to="/client-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="py-6 px-4 md:px-8 border-b bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Tabadl</span>
            <span className="text-lg text-muted-foreground">Client Portal</span>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/staff-login"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Staff Login
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              Welcome to Tabadl Client Portal
            </h1>
            <p className="mt-2 text-muted-foreground">
              Access your business services and documents
            </p>
          </div>

          <AuthCard
            activeTab={activeTab}
            onTabChange={setActiveTab}
            signInContent={
              <SignInForm
                onSubmit={handleSignIn}
                error={signInError?.message || null}
                isLoading={isSignInLoading}
              />
            }
            signUpContent={
              <SignUpForm
                onSubmit={handleSignUp}
                error={signUpError?.message || null}
                isLoading={isSignUpLoading}
              />
            }
          />
        </div>
      </div>

      <footer className="py-6 px-4 md:px-8 border-t bg-white">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Tabadl Business Services. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ClientLogin;
