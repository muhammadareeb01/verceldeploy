import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSignInMutation, useSignUpMutation } from "@/hooks/useUsers";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserRole } from "@/types/types";

const StaffLogin: React.FC = () => {
  const { user, userRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");
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

  const handleStaffSignIn = async (email: string, password: string) => {
    signIn(
      { email, password },
      {
        onSuccess: () => {
          console.log("StaffLogin: Sign-in successful");
        },
      }
    );
  };

  const handleStaffSignUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    signUp(
      { email, password, fullName, phone, role: UserRole.STAFF },
      {
        onSuccess: () => {
          console.log("StaffLogin: Sign-up successful");
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
    const redirectPath = "/dashboard";
    console.log(`StaffLogin: Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-primary">Staff Portal</h2>
          <p className="mt-2 text-gray-400">
            Tabadl Alkon administrative access
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-2xl text-primary">
              Access Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sign in or sign up to manage operations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-primary data-[state=active]:text-gray-900"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-gray-900"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm
                  onSubmit={handleStaffSignIn}
                  error={signInError?.message || null}
                  isLoading={isSignInLoading}
                />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm
                  onSubmit={handleStaffSignUp}
                  error={signUpError?.message || null}
                  isLoading={isSignUpLoading}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-gray-400">
              <p className="text-sm">
                This area is restricted to Tabadl Alkon staff only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffLogin;
