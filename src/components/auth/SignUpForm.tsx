import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SignUpFormProps {
  // Updated onSubmit signature to include phone
  onSubmit: (
    email: string,
    password: string,
    fullName: string,
    phone: string // Added phone parameter
  ) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  error,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(""); // Added phone state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pass phone to the onSubmit handler
    await onSubmit(email, password, fullName, phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          required // Made full name required
          disabled={isLoading}
        />
      </div>
      {/* Added Phone Number Input */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel" // Use type="tel" for phone number input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g., 442-421-5593" // Added example placeholder
          required // Made phone number required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {/* Removed the dynamic text referencing activeTab */}
      {/* <p className="text-xs text-muted-foreground mt-2">
        You'll be registered as a {activeTab === "signin" ? "staff" : "client"}{" "}
        user.
      </p> */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default SignUpForm;
