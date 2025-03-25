
import React, { useState } from 'react';
import { useStructuredLogger } from '@/hooks/notion/useStructuredLogger';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LogLevel } from '@/services/notion/errorHandling/types';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  BugPlay, 
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/**
 * Composant pour afficher les logs structurés
 */
const StructuredLogsDisplay: React.FC = () => {
  const {
    filteredLogs,
    updateFilter,
    clearFilter,
    filter,
    clearLogs
  } = useStructuredLogger();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceTerm, setSourceTerm] = useState('');
  const [page, setPage] = useState(1);
  const logsPerPage = 10;
  
  // Obtenir les logs pour la page actuelle
  const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  // Gérer la recherche
  const handleSearch = () => {
    updateFilter({ messageContains: searchTerm || undefined });
  };
  
  // Gérer la recherche par source
  const handleSourceFilter = () => {
    updateFilter({ source: sourceTerm || undefined });
  };
  
  // Réinitialiser tous les filtres
  const handleClearFilters = () => {
    clearFilter();
    setSearchTerm('');
    setSourceTerm('');
  };
  
  // Gérer le changement de niveau de log
  const handleLevelChange = (level: string) => {
    updateFilter({ level: level as LogLevel });
  };
  
  // Obtenir l'icône pour un niveau de log
  const getLevelIcon = (level?: LogLevel) => {
    switch (level) {
      case LogLevel.TRACE:
        return <BugPlay className="h-4 w-4 text-purple-500" />;
      case LogLevel.DEBUG:
        return <BugPlay className="h-4 w-4 text-blue-500" />;
      case LogLevel.INFO:
        return <Info className="h-4 w-4 text-green-500" />;
      case LogLevel.WARN:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case LogLevel.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case LogLevel.FATAL:
        return <AlertCircle className="h-4 w-4 text-red-700" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Obtenir la couleur de la badge pour un niveau de log
  const getLevelBadgeVariant = (level?: LogLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return 'destructive';
      case LogLevel.WARN:
        return 'default';
      case LogLevel.INFO:
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Logs structurés</CardTitle>
            <CardDescription>
              {filteredLogs.length} logs affichés
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearLogs} 
              title="Effacer tous les logs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearFilters}
              title="Effacer les filtres"
              disabled={!filter.level && !filter.messageContains && !filter.source}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="secondary" 
              onClick={handleSearch}
              size="icon"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Filtrer par source..."
              value={sourceTerm}
              onChange={(e) => setSourceTerm(e.target.value)}
              className="w-40"
            />
            <Button 
              variant="secondary" 
              onClick={handleSourceFilter}
              size="icon"
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <Select onValueChange={handleLevelChange} value={filter.level}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les niveaux</SelectItem>
                {Object.values(LogLevel).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Table des logs */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Timestamp</TableHead>
                <TableHead className="w-20">Niveau</TableHead>
                <TableHead className="w-32">Source</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, index) => (
                  <TableRow key={`${log.timestamp}-${index}`}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getLevelIcon(log.level)}
                        <Badge variant={getLevelBadgeVariant(log.level)}>
                          {log.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.source || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{log.message}</p>
                        {log.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {log.error.message}
                          </p>
                        )}
                        {log.tags && log.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {log.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {filteredLogs.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Aucun log disponible</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucun résultat pour les filtres actuels</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <CardFooter className="flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default StructuredLogsDisplay;
