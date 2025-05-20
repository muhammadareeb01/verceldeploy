
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseCardProps {
  id: string;
  clientName: string;
  serviceName: string;
  status: string;
  priority: number;
  progress: number;
  startDate: string;
  targetDate: string;
  assignedTo: string;
  onClick?: () => void;
}

const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'NOT_STARTED': 'status-not-started',
    'IN_PROGRESS': 'status-in-progress',
    'COMPLETED': 'status-completed',
    'ON_HOLD': 'status-on-hold',
    'CANCELLED': 'status-blocked',
  };
  
  return statusMap[status] || 'status-not-started';
};

const CaseCard: React.FC<CaseCardProps> = ({
  id,
  clientName,
  serviceName,
  status,
  priority,
  progress,
  startDate,
  targetDate,
  assignedTo,
  onClick,
}) => {
  const formattedStatus = status.replace(/_/g, ' ');
  
  const renderPriorityIndicator = (priority: number) => {
    const colors = ['bg-gray-200', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500'];
    return (
      <div className="flex items-center gap-1">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={cn('w-1.5 h-6 rounded-sm', i < priority ? colors[priority - 1] : 'bg-gray-200')}
            />
          ))}
      </div>
    );
  };

  return (
    <Card 
      className="card-hover cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{clientName}</h3>
            <p className="text-sm text-muted-foreground">{serviceName}</p>
          </div>
          <Badge className={cn("status-badge", getStatusColor(status))}>
            {formattedStatus}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm">
            <Calendar size={14} className="mr-1 text-tabadl-secondary" />
            <span className="text-muted-foreground">Start: {startDate}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock size={14} className="mr-1 text-tabadl-secondary" />
            <span className="text-muted-foreground">Target: {targetDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex items-center">
          <Users size={14} className="mr-1 text-muted-foreground" />
          <span className="text-sm">{assignedTo}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Priority:</span>
          {renderPriorityIndicator(priority)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CaseCard;
