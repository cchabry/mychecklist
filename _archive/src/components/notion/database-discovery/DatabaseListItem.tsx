
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Copy, Database, CheckCheck, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { NotionDatabaseTarget } from '../NotionDatabaseDiscovery';

interface DatabaseItemProps {
  id: string;
  title: string;
  createdTime: string;
  onSelectDatabase?: (id: string, target: NotionDatabaseTarget) => void;
}

// Définition des bases de données cibles avec leurs labels
const DATABASE_TARGETS: {id: NotionDatabaseTarget, label: string, description: string}[] = [
  { id: 'projects', label: 'Projets', description: 'Base de données principale des projets' },
  { id: 'checklists', label: 'Checklists', description: 'Référentiel de bonnes pratiques' },
  { id: 'exigences', label: 'Exigences', description: 'Exigences spécifiques par projet' },
  { id: 'pages', label: 'Pages', description: 'Échantillon de pages à auditer' },
  { id: 'audits', label: 'Audits', description: 'Audits réalisés sur les projets' },
  { id: 'evaluations', label: 'Évaluations', description: 'Résultats d\'évaluation par page et exigence' },
  { id: 'actions', label: 'Actions', description: 'Actions correctives à réaliser' },
  { id: 'progress', label: 'Progrès', description: 'Suivi des actions correctives' }
];

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
  
  const handleSelectForConfig = (target: NotionDatabaseTarget) => {
    if (onSelectDatabase) {
      onSelectDatabase(id, target);
      toast.success(`Base de données "${title}" sélectionnée pour "${DATABASE_TARGETS.find(db => db.id === target)?.label}"`);
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
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuLabel>Sélectionner pour</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DATABASE_TARGETS.map((target) => (
                  <DropdownMenuItem 
                    key={target.id} 
                    onClick={() => handleSelectForConfig(target.id)}
                    title={target.description}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {target.label}
                  </DropdownMenuItem>
                ))}
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
