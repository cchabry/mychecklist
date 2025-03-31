
import React, { useState } from 'react';
import { ArrowLeft, Database, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { NotionTestDataGenerator } from '@/components/notion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface AuditHeaderProps {
  project: Project;
  onSave?: () => void;
  onBack: () => void;
}

const AuditHeader: React.FC<AuditHeaderProps> = ({
  project,
  onSave,
  onBack
}) => {
  const [showTestDataGenerator, setShowTestDataGenerator] = useState(false);
  
  return <>
      <Button variant="ghost" onClick={onBack} className="mb-4 hover:text-tmw-teal">
        <ArrowLeft size={16} className="mr-2" />
        Retour aux projets
      </Button>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-tmw-darkgray">{project.name}</h1>
            <p className="text-muted-foreground">{project.url}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTestDataGenerator(true)}
            className="flex items-center gap-1"
          >
            <Database size={16} />
            <span className="hidden md:inline">Données de test</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowTestDataGenerator(true)}>
                <Database size={16} className="mr-2" />
                Générateur de données de test
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {onSave && (
            <Button onClick={onSave} className="bg-tmw-teal hover:bg-tmw-teal/90">
              Enregistrer
            </Button>
          )}
        </div>
      </div>
      
      <Dialog open={showTestDataGenerator} onOpenChange={setShowTestDataGenerator}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Générateur de données de test pour Notion</DialogTitle>
          <NotionTestDataGenerator onClose={() => setShowTestDataGenerator(false)} />
        </DialogContent>
      </Dialog>
    </>;
};

export default AuditHeader;
