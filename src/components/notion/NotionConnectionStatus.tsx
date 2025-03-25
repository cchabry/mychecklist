
import React from 'react';
import { Check, X, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOperationMode } from '@/services/operationMode';
import { OperationMode } from '@/services/operationMode/types';

interface NotionConnectionStatusProps {
  onConfigClick?: () => void;
  onReset?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Composant affichant l'état de connexion à Notion
 * avec le nouveau système operationMode
 */
const NotionConnectionStatus: React.FC<NotionConnectionStatusProps> = ({
  onConfigClick,
  onReset,
  className = '',
  compact = false
}) => {
  const { 
    mode, 
    isDemoMode, 
    isRealMode, 
    switchReason, 
    failures, 
    lastError,
    enableRealMode,
  } = useOperationMode();
  
  // Déterminer si une configuration Notion est disponible
  const hasNotionConfig = !!localStorage.getItem('notion_api_key') && 
                          !!localStorage.getItem('notion_database_id');
  
  // Version compacte (pour sidebars, etc.)
  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded ${className} ${
        isRealMode
          ? 'bg-green-50 text-green-700'
          : isDemoMode
            ? 'bg-blue-50 text-blue-700'
            : 'bg-gray-100 text-gray-700'
      }`}>
        {isRealMode ? (
          <Check size={16} className="text-green-600" />
        ) : isDemoMode ? (
          <Info size={16} className="text-blue-600" />
        ) : (
          <AlertTriangle size={16} className="text-amber-500" />
        )}
        
        <span className="text-sm font-medium">
          {isRealMode 
            ? "Connecté à Notion" 
            : isDemoMode 
              ? "Mode démonstration" 
              : "Non configuré"}
        </span>
        
        {onConfigClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onConfigClick}
          >
            <RefreshCw size={14} />
          </Button>
        )}
      </div>
    );
  }
  
  // Version complète
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Notion {isDemoMode ? "(Mode démonstration)" : ""}</span>
          
          {mode === OperationMode.REAL && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Connecté
            </Badge>
          )}
          
          {mode === OperationMode.DEMO && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Démo
            </Badge>
          )}
        </CardTitle>
        
        <CardDescription>
          {isRealMode
            ? "L'application est connectée à vos bases de données Notion"
            : isDemoMode
              ? "L'application utilise des données de démonstration"
              : "Configuration de la connexion à Notion"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {hasNotionConfig ? (
            <div className="text-sm">
              <div className="grid grid-cols-[24px_1fr] items-center gap-1">
                <Check size={18} className={isRealMode ? "text-green-600" : "text-gray-400"} />
                <span>Configuration Notion présente</span>
              </div>
              
              {isDemoMode && switchReason && (
                <div className="grid grid-cols-[24px_1fr] items-center gap-1 mt-1">
                  <Info size={18} className="text-blue-600" />
                  <span className="text-sm text-gray-600">{switchReason}</span>
                </div>
              )}
              
              {failures > 0 && (
                <div className="grid grid-cols-[24px_1fr] items-center gap-1 mt-1">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span className="text-sm text-gray-600">
                    {failures} tentative{failures > 1 ? 's' : ''} de connexion échouée{failures > 1 ? 's' : ''}
                    {lastError && <span className="block text-xs text-gray-500">{lastError.message}</span>}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-[24px_1fr] items-center gap-1">
              <X size={18} className="text-red-500" />
              <span className="text-sm">Configuration Notion manquante</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          {hasNotionConfig && isDemoMode && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => enableRealMode()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check size={16} className="mr-1" />
              Activer le mode réel
            </Button>
          )}
          
          {onReset && failures > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
            >
              <RefreshCw size={16} className="mr-1" />
              Réessayer
            </Button>
          )}
        </div>
        
        {onConfigClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onConfigClick}
          >
            Configurer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default NotionConnectionStatus;
