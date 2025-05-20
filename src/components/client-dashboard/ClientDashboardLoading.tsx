// Suggested file: src/components/client-dashboard/ClientDashboardLoading.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export const ClientDashboardLoading: React.FC = () => {
  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center h-screen">
      {" "}
      {/* Centered content */}
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />{" "}
      {/* Spinner */}
      <span className="text-lg text-muted-foreground">
        Loading client dashboard...
      </span>{" "}
      {/* Message */}
      {/* Optional: Add skeleton for layout while loading */}
      <div className="space-y-4 w-full mt-8">
        <Skeleton className="h-10 w-full max-w-md mx-auto" />{" "}
        {/* Skeleton for tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[250px]" /> // Skeletons for case cards
          ))}
        </div>
      </div>
    </div>
  );
};
