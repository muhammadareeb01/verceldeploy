
import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  positive?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  positive = true,
  className 
}) => {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {change && (
            <p className={cn(
              "text-xs mt-1",
              positive ? "text-green-600" : "text-red-600"
            )}>
              {positive ? "+" : "-"}{change} from last month
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-tabadl-light flex items-center justify-center text-tabadl-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
