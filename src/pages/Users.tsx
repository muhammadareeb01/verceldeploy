import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Users as UsersIcon, ArrowRight } from "lucide-react";

const Users = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">User Management</h1>
        <p className="text-muted-foreground">
          Manage staff members and client contacts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Staff Management
            </CardTitle>
            <CardDescription>
              Manage internal staff members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              View, edit, and manage staff members including administrators,
              account managers, document specialists, and finance officers.
            </p>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end">
            <Link to="/staff">
              <Button className="gap-2">
                View Staff
                <ArrowRight size={16} />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Client Management
            </CardTitle>
            <CardDescription>
              Manage client contacts and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              View, edit, and manage client information including personal
              details, associated companies, and communication preferences.
            </p>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end">
            <Link to="/clients">
              <Button className="gap-2">
                View Clients
                <ArrowRight size={16} />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Users;
