
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Copy, Database, CheckCheck, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseItemProps {
  id: string;
  title: string;
  createdTime: string;
  onSelectDatabase?: (id: string, target: 'projects' | 'checklists') => void;
}

const DatabaseListItem: React.FC<DatabaseItemProps> = ({ 
  id, 
  title, 
  createdTime,
  onSelectDatabase 
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    
    // Reset copy state after a delay
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast.success("ID copié dans le presse-papier");
  };
  
  const handleSelectForConfig = (target: 'projects' | 'checklists') => {
    if (onSelectDatabase) {
      onSelectDatabase(id, target);
      toast.success(`Base de données sélectionnée pour ${target === 'projects' ? 'Projets' : 'Checklists'}`);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={title}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 truncate" title={id}>
            {id}
          </p>
          <p className="text-xs text-gray-400">
            Créée le {createdTime}
          </p>
        </div>
        
        <div className="flex gap-2">
          {onSelectDatabase ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter à
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSelectForConfig('projects')}>
                  <Database className="h-4 w-4 mr-2" />
                  Base de Projets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelectForConfig('checklists')}>
                  <Database className="h-4 w-4 mr-2" />
                  Base de Checklists
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyId}
              className="shrink-0"
              title="Copier l'ID"
            >
              {copied ? (
                <CheckCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseListItem;
