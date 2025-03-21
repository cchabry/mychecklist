
import React from 'react';
import { AlertTriangle, XCircle, KeyRound } from 'lucide-react';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

export interface ErrorHeaderProps {
  error: string;
  context?: string;
  isPermissionError?: boolean;
}

const ErrorHeader: React.FC<ErrorHeaderProps> = ({
  error,
  context,
  isPermissionError = false
}) => {
  return (
    <AlertDialogHeader>
      <div className="flex items-start gap-3">
        {isPermissionError ? (
          <KeyRound className="h-5 w-5 text-amber-500 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        )}
        
        <div>
          <AlertDialogTitle className={isPermissionError ? "text-amber-700" : "text-red-700"}>
            {isPermissionError ? "Erreur de permission Notion" : "Erreur Notion"}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="mt-2 text-sm">
            <span className="font-medium">{error}</span>
            
            {context && (
              <p className="mt-2 text-muted-foreground text-xs">
                {context}
              </p>
            )}
          </AlertDialogDescription>
        </div>
      </div>
    </AlertDialogHeader>
  );
};

export default ErrorHeader;
