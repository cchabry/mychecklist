
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type TestStatus = 'pending' | 'success' | 'warning' | 'error';

export interface TestResult {
  name: string;
  description: string;
  status: TestStatus;
  details?: string;
}

interface NotionTestResultProps {
  test: TestResult;
}

const NotionTestResult: React.FC<NotionTestResultProps> = ({ test }) => {
  const getIcon = () => {
    switch (test.status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };
  
  const getBadgeVariant = () => {
    switch (test.status) {
      case 'success':
        return "default" as const;
      case 'warning':
        return "secondary" as const;
      case 'error':
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };
  
  return (
    <div className="flex items-start space-x-3 py-2">
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{test.name}</h4>
          <Badge variant={getBadgeVariant()}>
            {test.status === 'success' ? 'Succès' : 
              test.status === 'warning' ? 'Avertissement' : 
              test.status === 'error' ? 'Échec' : 'En cours'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{test.description}</p>
        {test.details && (
          <p className="mt-1 text-xs whitespace-pre-wrap bg-muted p-1.5 rounded">
            {test.details}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotionTestResult;
