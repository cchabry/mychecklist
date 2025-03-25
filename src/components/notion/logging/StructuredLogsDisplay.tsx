
import React, { useState, useCallback, useMemo } from 'react';
import { useStructuredLogger } from '@/hooks/notion/useStructuredLogger';
import { StructuredLog, LogLevel } from '@/services/notion/types/unified';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Filter, RefreshCw } from 'lucide-react';

interface StructuredLogsDisplayProps {
  title?: string;
  maxHeight?: string;
  showControls?: boolean;
  defaultLevel?: LogLevel;
}

const StructuredLogsDisplay: React.FC<StructuredLogsDisplayProps> = ({
  title = "Logs structurés",
  maxHeight = "300px",
  showControls = true,
  defaultLevel = LogLevel.INFO
}) => {
  const { logs, clearLogs, logger } = useStructuredLogger();
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  
  // Filtrer les logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesText = filter ? 
        log.message.toLowerCase().includes(filter.toLowerCase()) || 
        (log.data && JSON.stringify(log.data).toLowerCase().includes(filter.toLowerCase())) : 
        true;
      
      const matchesLevel = levelFilter !== 'all' ? 
        log.level === levelFilter : 
        true;
      
      return matchesText && matchesLevel;
    });
  }, [logs, filter, levelFilter]);
  
  // Mettre à jour le filtre
  const updateFilter = useCallback((value: string) => {
    setFilter(value);
  }, []);
  
  // Effacer le filtre
  const clearFilter = useCallback(() => {
    setFilter('');
    setLevelFilter('all');
  }, []);
  
  // Log des messages de test
  const logTestMessages = useCallback(() => {
    if (logger) {
      logger.debug && logger.debug('Test message de niveau DEBUG', { source: 'Test' });
      logger.info('Test message de niveau INFO', { test: true, value: 42 });
      logger.warn && logger.warn('Test message de niveau WARN', { alert: 'Attention' });
      logger.error('Test message de niveau ERROR', new Error('Test error'));
    }
  }, [logger]);
  
  // Rendu du composant
  return (
    <div className="space-y-4">
      {showControls && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Filtrer les logs..."
                value={filter}
                onChange={(e) => updateFilter(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={levelFilter}
              onValueChange={(value) => setLevelFilter(value as LogLevel | 'all')}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value={LogLevel.TRACE}>Trace</SelectItem>
                <SelectItem value={LogLevel.DEBUG}>Debug</SelectItem>
                <SelectItem value={LogLevel.INFO}>Info</SelectItem>
                <SelectItem value={LogLevel.WARN}>Warn</SelectItem>
                <SelectItem value={LogLevel.ERROR}>Error</SelectItem>
                <SelectItem value={LogLevel.FATAL}>Fatal</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={clearFilter}>
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon" onClick={clearLogs}>
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon" onClick={logTestMessages}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="overflow-auto" style={{ maxHeight }}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun log à afficher
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 border rounded-md text-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        log.level === LogLevel.ERROR || log.level === LogLevel.FATAL
                          ? "destructive"
                          : log.level === LogLevel.WARN
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {log.level}
                    </Badge>
                    <span className="font-medium">{log.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {log.data && (
                  <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono">
                    {typeof log.data === 'string' 
                      ? log.data
                      : JSON.stringify(log.data, null, 2)}
                  </div>
                )}
                
                {log.context && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {typeof log.context === 'string'
                      ? log.context
                      : Object.entries(log.context).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructuredLogsDisplay;
