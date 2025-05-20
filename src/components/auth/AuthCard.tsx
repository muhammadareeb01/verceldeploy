
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthCardProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  signInContent: React.ReactNode;
  signUpContent: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ 
  activeTab, 
  onTabChange, 
  signInContent, 
  signUpContent 
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Tabadl Business Services</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            {signInContent}
          </TabsContent>
          
          <TabsContent value="signup">
            {signUpContent}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tabadl - All rights reserved
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthCard;
