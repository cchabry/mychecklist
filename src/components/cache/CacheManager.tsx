
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CacheEntriesTable from './CacheEntriesTable';
import CacheSearch from './CacheSearch';
import CacheControls from './CacheControls';
import CacheFooter from './CacheFooter';
import { useCacheManager } from './useCacheManager';

const CacheManagerComponent: React.FC = () => {
  const {
    cacheEntries,
    searchTerm,
    setSearchTerm,
    handleRefresh,
    handleCleanExpired,
    handleDeleteEntry,
    handleClearAll
  } = useCacheManager();
  
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
          <CacheControls 
            onRefresh={handleRefresh} 
            onCleanExpired={handleCleanExpired} 
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <CacheSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        <CacheEntriesTable 
          entries={searchTerm ? cacheEntries : cacheEntries} 
          onDeleteEntry={handleDeleteEntry} 
        />
      </CardContent>
      
      <CardFooter>
        <CacheFooter 
          entriesCount={cacheEntries.length} 
          onClearAll={handleClearAll} 
        />
      </CardFooter>
    </Card>
  );
};

export default CacheManagerComponent;
