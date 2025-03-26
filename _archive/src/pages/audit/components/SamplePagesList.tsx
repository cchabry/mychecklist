
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { SamplePage } from '@/lib/types';

interface SamplePagesListProps {
  pages: SamplePage[];
  projectId: string;
  onAddPage?: () => void;
  onEditPage?: (page: SamplePage) => void;
  onDeletePage?: (pageId: string) => void;
}

const SamplePagesList: React.FC<SamplePagesListProps> = ({
  pages,
  projectId,
  onAddPage,
  onEditPage,
  onDeletePage
}) => {
  // Trier les pages par ordre
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  
  return (
    <Card className="border border-tmw-blue/10 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pages de l'échantillon</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddPage}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une page</span>
          </Button>
        </div>
        
        {sortedPages.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Aucune page dans l'échantillon</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez des pages pour commencer l'audit
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ordre</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead className="hidden md:table-cell">URL</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.order}</TableCell>
                  <TableCell>{page.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground truncate">
                    <a 
                      href={page.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      {page.url.length > 30 ? `${page.url.substring(0, 30)}...` : page.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditPage && onEditPage(page)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeletePage && onDeletePage(page.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SamplePagesList;
