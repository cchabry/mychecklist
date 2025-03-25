
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
      logger.debug('Test message de niveau DEBUG', { source: 'Test' });
      logger.info('Test message de niveau INFO', { test: true, value: 42 });
      logger.warn('Test message de niveau WARN', { alert: 'Attention' });
      logger.error('Test message de niveau ERROR', new Error('Test error'));
    }
  }, [logger]);
  
  return {
    logs: filteredLogs,
    updateFilter,
    clearFilter,
    filter,
    levelFilter,
    setLevelFilter,
    clearLogs,
    logTestMessages
  };
};

export default StructuredLogsDisplay;
