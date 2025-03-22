
import React, { useState, useEffect } from 'react';
import { cacheService } from '@/services/cache/cache';
import { cacheManager } from '@/services/cache/cacheManager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash, RefreshCw, Search, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const CacheManagerComponent: React.FC = () => {
  const [cacheEntries, setCacheEntries] = useState<Array<any>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Charger les entrées du cache
  useEffect(() => {
    const loadEntries = () => {
      const entries = cacheService.getAll().filter(entry => {
        if (!searchTerm) return true;
        return entry.key.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Trier par date de création (plus récent d'abord)
      entries.sort((a, b) => b.timestamp - a.timestamp);
      
      setCacheEntries(entries);
    };
    
    loadEntries();
  }, [searchTerm, refreshTrigger]);
  
  // Formater l'expiration
  const formatExpiry = (expiry: number | null): string => {
    if (expiry === null) return 'Jamais';
    
    const now = Date.now();
    if (expiry < now) return 'Expiré';
    
    return formatDistanceToNow(expiry, { addSuffix: true, locale: fr });
  };
  
  // Refresh le cache
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Nettoyer les entrées expirées
  const handleCleanExpired = () => {
    const count = cacheService.cleanExpired();
    handleRefresh();
  };
  
  // Supprimer une entrée
  const handleDeleteEntry = (key: string) => {
    cacheService.remove(key);
    handleRefresh();
  };
  
  // Vider tout le cache
  const handleClearAll = () => {
    cacheEntries.forEach(entry => {
      cacheService.remove(entry.key);
    });
    handleRefresh();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestionnaire de cache</CardTitle>
            <CardDescription>
              Visualisez et gérez les entrées du cache local
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleCleanExpired}>
              <Clock className="h-4 w-4 mr-2" />
              Nettoyer expirés
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par clé..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {cacheEntries.length > 0 ? (
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
                {cacheEntries.map((entry) => {
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
                          onClick={() => handleDeleteEntry(entry.key)}
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
        ) : (
          <div className="text-center py-8 border rounded-md bg-muted/10">
            <p className="text-muted-foreground">
              {searchTerm ? 'Aucune entrée ne correspond à votre recherche' : 'Le cache est vide'}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {cacheEntries.length} entrées dans le cache
        </div>
        
        {cacheEntries.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash className="h-4 w-4 mr-2" />
            Vider le cache
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CacheManagerComponent;
