
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStructuredLogger } from '@/hooks/notion/useStructuredLogger';
import { LogLevel } from '@/services/notion/types/unified';
import LogEntryDisplay from './LogEntryDisplay';

interface StructuredLogsDisplayProps {
  maxHeight?: string;
  title?: string;
  compact?: boolean;
}

const StructuredLogsDisplay: React.FC<StructuredLogsDisplayProps> = ({ maxHeight = '400px', title = "Logs structurés", compact = false }) => {
  const { filteredLogs, clearLogs, updateFilter, filter, levelFilter, setLevelFilter, exportLogs } = useStructuredLogger();
  const [searchInput, setSearchInput] = useState<string>('');
  
  // Gérer l'exportation des logs
  const handleExportLogs = () => {
    try {
      const logsData = exportLogs();
      const blob = new Blob([logsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur lors de l\'exportation des logs:', e);
    }
  };
  
  // Gérer la mise à jour du filtre
  const handleSearch = () => {
    updateFilter(searchInput);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLogs}
          >
            Effacer
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportLogs}
          >
            Exporter
          </Button>
        </div>
      </div>
      
      {!compact && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher dans les logs..."
            className="flex-1 px-3 py-1 border rounded text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleSearch}
          >
            Filtrer
          </Button>
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'all')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">Tous</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warning</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.FATAL}>Fatal</option>
          </select>
        </div>
      )}
      
      <ScrollArea className={`border rounded-md ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
        <div className="p-2 space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {filter ? 'Aucun résultat pour ce filtre' : 'Aucun log à afficher'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <LogEntryDisplay 
                key={log.id} 
                log={log} 
                compact={compact} 
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="text-xs text-muted-foreground">
        {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} {filter && 'filtrés'}
      </div>
    </div>
  );
};

export default StructuredLogsDisplay;
