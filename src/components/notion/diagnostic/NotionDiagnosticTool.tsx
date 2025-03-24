
import React from 'react';
import { Button } from '@/components/ui/button';
import { BadgeCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface NotionDiagnosticToolProps {
  onRunDiagnostics: () => void;
  isRunning?: boolean;
  lastStatus?: 'success' | 'error' | null;
  errorCount?: number;
}

export const NotionDiagnosticTool: React.FC<NotionDiagnosticToolProps> = ({
  onRunDiagnostics,
  isRunning = false,
  lastStatus = null,
  errorCount = 0
}) => {
  return (
    <Card className="mt-4">
      <CardContent className="p-4 flex flex-col">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-medium">Diagnostic Notion</h3>
            <p className="text-sm text-muted-foreground">
              Tester les permissions et la connectivité
            </p>
          </div>
          
          <Button 
            onClick={onRunDiagnostics} 
            disabled={isRunning}
            variant={lastStatus === 'error' ? "destructive" : "default"}
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : lastStatus === 'success' ? (
              <BadgeCheck className="mr-2 h-4 w-4" />
            ) : lastStatus === 'error' ? (
              <AlertTriangle className="mr-2 h-4 w-4" />
            ) : null}
            
            {isRunning 
              ? "Test en cours..." 
              : lastStatus === 'success' 
                ? "Tests réussis" 
                : lastStatus === 'error' 
                  ? `${errorCount} erreur${errorCount > 1 ? 's' : ''}` 
                  : "Lancer les tests"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionDiagnosticTool;
