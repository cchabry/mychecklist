
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AuditItem, ComplianceStatus, PageResult, SamplePage } from '@/lib/types';
import { Check, X, Minus, AlertTriangle, Globe, Upload } from 'lucide-react';
import { getComplianceStatusColor } from '../utils/complianceUtils';
import { toast } from 'sonner';

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
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus | null>(null);
  const [bulkComment, setBulkComment] = useState('');
  const [showBulkAction, setShowBulkAction] = useState(false);

  const findPageResult = (pageId: string): PageResult | undefined => {
    return item.pageResults?.find(result => result.pageId === pageId);
  };

  const updatePageStatus = (pageId: string, status: ComplianceStatus, comment: string = '') => {
    const currentResults = item.pageResults || [];
    const existingResultIndex = currentResults.findIndex(r => r.pageId === pageId);
    let newResults;
    if (existingResultIndex >= 0) {
      newResults = [...currentResults];
      newResults[existingResultIndex] = {
        ...newResults[existingResultIndex],
        status,
        comment: comment || newResults[existingResultIndex].comment
      };
    } else {
      newResults = [...currentResults, {
        pageId,
        status,
        comment
      }];
    }
    onUpdatePageResults(newResults);
  };

  const applyBulkAction = () => {
    if (!selectedStatus) {
      toast.error("Sélectionnez un statut à appliquer");
      return;
    }
    const newResults = pages.map(page => {
      const existing = findPageResult(page.id);
      return {
        pageId: page.id,
        status: selectedStatus,
        comment: bulkComment || existing?.comment || ''
      };
    });
    onUpdatePageResults(newResults);
    setShowBulkAction(false);
    setSelectedStatus(null);
    setBulkComment('');
    toast.success("Évaluation appliquée à toutes les pages");
  };

  const getStatusClasses = (status: ComplianceStatus | null, type: string = 'bg') => {
    if (!status) return '';
    if (type === 'bg') {
      return `bg-${status === ComplianceStatus.Compliant ? 'green' : status === ComplianceStatus.PartiallyCompliant ? 'amber' : status === ComplianceStatus.NonCompliant ? 'red' : 'gray'}-100`;
    }
    if (type === 'text') {
      return `text-${status === ComplianceStatus.Compliant ? 'green' : status === ComplianceStatus.PartiallyCompliant ? 'amber' : status === ComplianceStatus.NonCompliant ? 'red' : 'gray'}-700`;
    }
    if (type === 'border') {
      return `border-${status === ComplianceStatus.Compliant ? 'green' : status === ComplianceStatus.PartiallyCompliant ? 'amber' : status === ComplianceStatus.NonCompliant ? 'red' : 'gray'}-200`;
    }
    return '';
  };

  const StatusIcon = ({
    status
  }: {
    status: ComplianceStatus;
  }) => {
    switch (status) {
      case ComplianceStatus.Compliant:
        return <Check className="h-5 w-5 text-green-600" />;
      case ComplianceStatus.PartiallyCompliant:
        return <Minus className="h-5 w-5 text-amber-500" />;
      case ComplianceStatus.NonCompliant:
        return <X className="h-5 w-5 text-red-500" />;
      case ComplianceStatus.NotApplicable:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  return <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium mb-1">Évaluation par page</h3>
          <p className="text-sm text-muted-foreground">
            Évaluez la conformité de chaque page de l'échantillon pour ce critère
          </p>
        </div>
        <Button onClick={() => setShowBulkAction(!showBulkAction)} variant={showBulkAction ? "secondary" : "outline"} size="sm">
          {showBulkAction ? "Annuler" : "Évaluer toutes les pages"}
        </Button>
      </div>
      
      {showBulkAction && <Card className="border-dashed border-2 border-primary/30 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Évaluation globale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Appliquer le même résultat à toutes les pages de l'échantillon pour ce critère.
              Vous pourrez ensuite modifier individuellement chaque page si nécessaire.
            </p>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              <Button variant="outline" size="sm" className={`transition-all duration-200 ${selectedStatus === ComplianceStatus.NonCompliant ? 'bg-red-100 text-red-700 border-red-300' : ''}`} onClick={() => setSelectedStatus(ComplianceStatus.NonCompliant)}>
                <X size={16} className="mr-1.5" />
                Non conforme
              </Button>
              
              <Button variant="outline" size="sm" className={`transition-all duration-200 ${selectedStatus === ComplianceStatus.PartiallyCompliant ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}`} onClick={() => setSelectedStatus(ComplianceStatus.PartiallyCompliant)}>
                <Minus size={16} className="mr-1.5" />
                Partiellement
              </Button>
              
              <Button variant="outline" size="sm" className={`transition-all duration-200 ${selectedStatus === ComplianceStatus.Compliant ? 'bg-green-100 text-green-700 border-green-300' : ''}`} onClick={() => setSelectedStatus(ComplianceStatus.Compliant)}>
                <Check size={16} className="mr-1.5" />
                Conforme
              </Button>
              
              <Button variant="outline" size="sm" className={`transition-all duration-200 ${selectedStatus === ComplianceStatus.NotApplicable ? 'bg-gray-100 text-gray-700 border-gray-300' : ''}`} onClick={() => setSelectedStatus(ComplianceStatus.NotApplicable)}>
                <AlertTriangle size={16} className="mr-1.5" />
                Non applicable
              </Button>
            </div>
            
            <Textarea placeholder="Commentaire global pour toutes les pages..." value={bulkComment} onChange={e => setBulkComment(e.target.value)} className="mb-4" />
            
            <Button onClick={applyBulkAction} disabled={!selectedStatus} className="w-full">
              Appliquer à toutes les pages ({pages.length})
            </Button>
          </CardContent>
        </Card>}
      
      <div className="space-y-4">
        {pages.map(page => {
        const pageResult = findPageResult(page.id);
        return <Card key={page.id} className={`border overflow-hidden ${pageResult ? getStatusClasses(pageResult.status, 'border') : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={16} className="text-muted-foreground" />
                    <h4 className="font-medium">{page.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{page.url}</p>
                  
                  <div className="mt-4 space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Upload size={14} className="mr-1" />
                      Joindre
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 md:w-2/3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Évaluation</h4>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <Button variant="outline" size="sm" className={`transition-all duration-200 ${pageResult?.status === ComplianceStatus.NonCompliant ? 'bg-red-100 text-red-700 border-red-300' : ''}`} onClick={() => updatePageStatus(page.id, ComplianceStatus.NonCompliant, pageResult?.comment)}>
                      <X size={16} className="mr-1" />
                      Non conforme
                    </Button>
                    
                    <Button variant="outline" size="sm" className={`transition-all duration-200 ${pageResult?.status === ComplianceStatus.PartiallyCompliant ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}`} onClick={() => updatePageStatus(page.id, ComplianceStatus.PartiallyCompliant, pageResult?.comment)}>
                      <Minus size={16} className="mr-1" />
                      Partiellement
                    </Button>
                    
                    <Button variant="outline" size="sm" className={`transition-all duration-200 ${pageResult?.status === ComplianceStatus.Compliant ? 'bg-green-100 text-green-700 border-green-300' : ''}`} onClick={() => updatePageStatus(page.id, ComplianceStatus.Compliant, pageResult?.comment)}>
                      <Check size={16} className="mr-1" />
                      Conforme
                    </Button>
                    
                    <Button variant="outline" size="sm" className={`transition-all duration-200 ${pageResult?.status === ComplianceStatus.NotApplicable ? 'bg-gray-100 text-gray-700 border-gray-300' : ''}`} onClick={() => updatePageStatus(page.id, ComplianceStatus.NotApplicable, pageResult?.comment)}>
                      <AlertTriangle size={16} className="mr-1" />
                      Non applicable
                    </Button>
                  </div>
                  
                  <Textarea placeholder="Commentaire sur l'évaluation de cette page..." value={pageResult?.comment || ''} onChange={e => updatePageStatus(page.id, pageResult?.status || ComplianceStatus.NotEvaluated, e.target.value)} className="text-sm" />
                </div>
              </div>
            </Card>;
      })}
      </div>
    </div>;
};

export default PageEvaluationList;
