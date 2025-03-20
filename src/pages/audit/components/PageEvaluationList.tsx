
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  SamplePage,
  AuditItem,
  ComplianceStatus,
  COMPLIANCE_VALUES,
  PageResult
} from '@/lib/types';
import { ExternalLink, PlusCircle, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getComplianceStatusColor } from '../utils/complianceUtils';

interface PageEvaluationListProps {
  item: AuditItem;
  pages: SamplePage[];
  onUpdatePageResults: (pageResults: PageResult[]) => void;
}

const PageEvaluationList: React.FC<PageEvaluationListProps> = ({
  item,
  pages,
  onUpdatePageResults
}) => {
  // États locaux pour les évaluations en cours d'édition
  const [editingResults, setEditingResults] = useState<Record<string, {
    status: ComplianceStatus,
    comment: string
  }>>({});
  
  // Initialiser l'état d'édition avec les résultats existants
  React.useEffect(() => {
    const initialEditState: Record<string, {
      status: ComplianceStatus,
      comment: string
    }> = {};
    
    pages.forEach(page => {
      const existingResult = item.pageResults?.find(result => result.pageId === page.id);
      initialEditState[page.id] = {
        status: existingResult?.status || ComplianceStatus.NotEvaluated,
        comment: existingResult?.comment || ''
      };
    });
    
    setEditingResults(initialEditState);
  }, [item.pageResults, pages]);
  
  // Mettre à jour le statut d'une page
  const handleStatusChange = (pageId: string, status: ComplianceStatus) => {
    setEditingResults(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        status
      }
    }));
  };
  
  // Mettre à jour le commentaire d'une page
  const handleCommentChange = (pageId: string, comment: string) => {
    setEditingResults(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        comment
      }
    }));
  };
  
  // Appliquer la même évaluation à toutes les pages
  const applyToAllPages = (sourcePageId: string) => {
    const sourceResult = editingResults[sourcePageId];
    if (!sourceResult) return;
    
    const newResults = { ...editingResults };
    pages.forEach(page => {
      if (page.id !== sourcePageId) {
        newResults[page.id] = { ...sourceResult };
      }
    });
    
    setEditingResults(newResults);
  };
  
  // Sauvegarder les évaluations
  const savePageResults = () => {
    const results: PageResult[] = Object.entries(editingResults).map(([pageId, data]) => ({
      pageId,
      status: data.status,
      comment: data.comment
    }));
    
    onUpdatePageResults(results);
  };
  
  // Vérifier si tous les pages ont été évaluées
  const allPagesEvaluated = pages.every(page => 
    editingResults[page.id]?.status !== ComplianceStatus.NotEvaluated
  );
  
  // Calculer le statut global pour l'exigence
  const calculateOverallStatus = (): ComplianceStatus => {
    if (pages.length === 0) return ComplianceStatus.NotEvaluated;
    
    const results = Object.values(editingResults);
    const evaluatedResults = results.filter(r => 
      r.status !== ComplianceStatus.NotEvaluated && 
      r.status !== ComplianceStatus.NotApplicable
    );
    
    if (evaluatedResults.length === 0) return ComplianceStatus.NotEvaluated;
    
    const compliantCount = evaluatedResults.filter(r => r.status === ComplianceStatus.Compliant).length;
    const nonCompliantCount = evaluatedResults.filter(r => r.status === ComplianceStatus.NonCompliant).length;
    
    if (nonCompliantCount > 0) return ComplianceStatus.NonCompliant;
    if (compliantCount === evaluatedResults.length) return ComplianceStatus.Compliant;
    return ComplianceStatus.PartiallyCompliant;
  };
  
  return (
    <Card className="mt-4 border border-tmw-blue/10">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">Évaluation par page</CardTitle>
            <CardDescription>
              Évaluez la conformité de chaque page de l'échantillon
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={savePageResults}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Aucune page dans l'échantillon</p>
            <Button variant="outline" className="mt-4 flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Ajouter des pages à l'échantillon</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="text-sm font-medium mb-1">Statut global : </p>
              <Badge 
                className="text-md"
                variant="outline"
                style={{ 
                  backgroundColor: getComplianceStatusColor(calculateOverallStatus(), "bg"),
                  color: getComplianceStatusColor(calculateOverallStatus(), "text")
                }}
              >
                {calculateOverallStatus()}
              </Badge>
              {!allPagesEvaluated && (
                <p className="text-sm text-muted-foreground mt-2">
                  Attention : certaines pages n'ont pas encore été évaluées
                </p>
              )}
            </div>
            
            {pages.map((page) => (
              <div key={page.id} className="border rounded-md p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                  <div>
                    <h4 className="font-medium">{page.title}</h4>
                    <a 
                      href={page.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary"
                    >
                      {page.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={editingResults[page.id]?.status || ComplianceStatus.NotEvaluated}
                      onValueChange={(value) => handleStatusChange(page.id, value as ComplianceStatus)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ComplianceStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyToAllPages(page.id)}
                      title="Appliquer à toutes les pages"
                    >
                      Appliquer à toutes
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Commentaire sur l'évaluation..."
                  value={editingResults[page.id]?.comment || ''}
                  onChange={(e) => handleCommentChange(page.id, e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            ))}
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={savePageResults}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer les évaluations</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageEvaluationList;
