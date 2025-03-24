
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useState } from 'react';
import DatabaseList from './DatabaseList';
import WriteTestButton from './WriteTestButton';
import { NotionDatabaseTarget } from '../NotionDatabaseDiscovery';

export interface DiscoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: string;
  onSelectDatabase?: (id: string, target: NotionDatabaseTarget) => void;
  autoClose?: boolean;
}

export const DiscoveryDialog: React.FC<DiscoveryDialogProps> = ({
  open,
  onOpenChange,
  apiKey,
  onSelectDatabase,
  autoClose = true,
}) => {
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  
  const handleSelectDatabase = (id: string, target: NotionDatabaseTarget) => {
    setSelectedDatabase(id);
    
    if (onSelectDatabase) {
      onSelectDatabase(id, target);
    }
    
    if (autoClose) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Sélectionner une base de données Notion</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="databases">
          <TabsList className="grid grid-cols-1 w-[200px]">
            <TabsTrigger value="databases">Bases de données</TabsTrigger>
          </TabsList>
          
          <TabsContent value="databases" className="pt-4">
            <DatabaseList 
              apiKey={apiKey}
              onSelectDatabase={handleSelectDatabase}
            />
            
            {selectedDatabase && (
              <div className="mt-4 pt-4 border-t flex justify-end">
                <WriteTestButton 
                  databaseId={selectedDatabase}
                  apiKey={apiKey}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
