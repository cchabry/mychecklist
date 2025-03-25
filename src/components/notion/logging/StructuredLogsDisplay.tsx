
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useStructuredLogger } from '@/hooks/notion/useStructuredLogger';
import { StructuredLogMessage, LogLevel } from '@/services/notion/types/unified';
import { Trash, Filter, ArrowDown, ArrowUp, Download } from 'lucide-react';

const StructuredLogsDisplay: React.FC = () => {
  const { logs, clearLogs, exportLogs } = useStructuredLogger();
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filtrer les logs en fonction de l'onglet sélectionné
  const filteredLogs = logs.filter(log => {
    if (currentTab === 'all') return true;
    
    switch (currentTab) {
      case 'debug': return log.level === LogLevel.DEBUG;
      case 'info': return log.level === LogLevel.INFO;
      case 'warn': return log.level === LogLevel.WARN;
      case 'error': return log.level === LogLevel.ERROR || log.level === LogLevel.FATAL;
      default: return true;
    }
  });
  
  // Trier les logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  // Exporter les logs actuellement visibles
  const handleExport = () => {
    if (typeof exportLogs === 'function') {
      exportLogs(sortedLogs);
    } else {
      console.warn('Export logs function not available');
      
      // Fallback: export en JSON
      const data = JSON.stringify(sortedLogs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    }
  };
  
  // Obtenir un badge pour le niveau de log
  const getLevelBadge = (level: LogLevel) => {
    let variant: "default" | "destructive" | "outline" | "secondary" | "success" = "default";
    let text = '';
    
    switch (level) {
      case LogLevel.DEBUG:
        variant = "secondary";
        text = 'DEBUG';
        break;
      case LogLevel.INFO:
        variant = "default";
        text = 'INFO';
        break;
      case LogLevel.WARN:
        variant = "outline";
        text = 'WARN';
        break;
      case LogLevel.ERROR:
        variant = "destructive";
        text = 'ERROR';
        break;
      case LogLevel.FATAL:
        variant = "destructive";
        text = 'FATAL';
        break;
      default:
        variant = "secondary";
        text = 'UNKNOWN';
    }
    
    return (
      <Badge variant={variant} className="text-xs font-mono">
        {text}
      </Badge>
    );
  };
  
  // Formater les données du log
  const formatLogData = (data: any): string => {
    if (!data) return '';
    
    if (data instanceof Error) {
      return `${data.name}: ${data.message}`;
    }
    
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data);
      } catch (e) {
        return '[Objet non sérialisable]';
      }
    }
    
    return String(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Logs structurés</CardTitle>
            <CardDescription>
              {sortedLogs.length} entrée{sortedLogs.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="warn">Warn</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-0">
            {sortedLogs.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {sortedLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className="p-2 text-sm border rounded hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-2 items-center">
                          {getLevelBadge(log.level)}
                          
                          {log.source && (
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                          )}
                        </div>
                        
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="mt-1 font-medium">{log.message}</div>
                      
                      {log.data && (
                        <div className="mt-1 text-xs bg-slate-50 p-2 rounded font-mono overflow-x-auto">
                          {formatLogData(log.data)}
                        </div>
                      )}
                      
                      {log.context && Object.keys(log.context).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Contexte: {formatLogData(log.context)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun log disponible</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StructuredLogsDisplay;
