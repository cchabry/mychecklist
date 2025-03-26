
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { StructuredLog, LogLevel } from '@/services/notion/types/unified';
import { Button } from '@/components/ui/button';

interface LogEntryDisplayProps {
  log: StructuredLog;
  compact?: boolean;
}

const LogEntryDisplay: React.FC<LogEntryDisplayProps> = ({ log, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Obtenir la classe CSS de couleur en fonction du niveau
  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-500';
      case LogLevel.INFO:
        return 'text-blue-500';
      case LogLevel.WARN:
        return 'text-amber-500';
      case LogLevel.ERROR:
        return 'text-red-500';
      case LogLevel.FATAL:
        return 'text-purple-500';
      default:
        return 'text-gray-700';
    }
  };
  
  // Formatage de la date
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Affiche les données additionnelles si présentes
  const renderData = () => {
    if (!log.data) return null;
    
    try {
      const formattedData = typeof log.data === 'object' 
        ? JSON.stringify(log.data, null, 2) 
        : String(log.data);
        
      return (
        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
          {formattedData}
        </pre>
      );
    } catch (e) {
      return <p className="text-xs text-red-400">Erreur d'affichage des données</p>;
    }
  };
  
  // Version compacte du log
  if (compact) {
    return (
      <div className={`text-xs py-1 px-2 rounded ${expanded ? 'bg-gray-50' : ''}`}>
        <div className="flex items-start">
          <span className="text-gray-400 mr-2">{formatTimestamp(log.timestamp)}</span>
          <span className={`font-medium mr-2 ${getLevelColor(log.level)}`}>
            [{log.level}]
          </span>
          <span className="flex-1">{log.message}</span>
        </div>
        
        {expanded && log.data && renderData()}
        
        {(log.data || log.context) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto text-xs text-gray-400 hover:text-gray-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            {expanded ? 'Réduire' : 'Détails'}
          </Button>
        )}
      </div>
    );
  }
  
  // Version complète du log
  return (
    <div className={`py-2 px-3 rounded border ${expanded ? 'bg-gray-50' : ''}`}>
      <div className="flex items-start mb-1">
        <span className="text-gray-400 mr-2 text-xs">{formatTimestamp(log.timestamp)}</span>
        <span className={`font-medium mr-2 ${getLevelColor(log.level)}`}>
          [{log.level}]
        </span>
        <span className="flex-1">{log.message}</span>
        
        {(log.data || log.context) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-5 text-xs text-gray-400 hover:text-gray-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
          </Button>
        )}
      </div>
      
      {expanded && (
        <div className="pl-4 mt-2 space-y-2">
          {log.context && (
            <div className="text-xs">
              <span className="text-gray-500">Contexte:</span> {typeof log.context === 'object' 
                ? JSON.stringify(log.context) 
                : String(log.context)
              }
            </div>
          )}
          
          {log.data && renderData()}
        </div>
      )}
    </div>
  );
};

export default LogEntryDisplay;
