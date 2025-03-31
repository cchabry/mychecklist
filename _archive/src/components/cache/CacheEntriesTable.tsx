
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CacheEntry {
  key: string;
  data: any;
  expiry: number | null;
  timestamp: number;
}

interface CacheEntriesTableProps {
  entries: CacheEntry[];
  onDeleteEntry: (key: string) => void;
}

const CacheEntriesTable: React.FC<CacheEntriesTableProps> = ({ 
  entries, 
  onDeleteEntry 
}) => {
  // Formater l'expiration
  const formatExpiry = (expiry: number | null): string => {
    if (expiry === null) return 'Jamais';
    
    const now = Date.now();
    if (expiry < now) return 'Expiré';
    
    return formatDistanceToNow(expiry, { addSuffix: true, locale: fr });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">
          Le cache est vide
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Clé</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Créé</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isExpired = entry.expiry !== null && entry.expiry < Date.now();
            const dataType = Array.isArray(entry.data) 
              ? 'array' 
              : typeof entry.data === 'object' && entry.data !== null
              ? 'object'
              : typeof entry.data;
            
            return (
              <TableRow key={entry.key}>
                <TableCell className="font-mono text-xs">
                  {entry.key}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{dataType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      isExpired 
                        ? "destructive" 
                        : entry.expiry === null 
                        ? "outline" 
                        : "default"
                    }
                  >
                    {formatExpiry(entry.expiry)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: fr })}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteEntry(entry.key)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CacheEntriesTable;
