
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle, 
  Button,
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Label
} from '@/components/ui/';
import { AuditItem, ComplianceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SamplePage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface ExigenceChecklistProps {
  item: AuditItem;
  samplePages: SamplePage[];
  importance: string;
  onItemChange: (itemId: string, status: ComplianceStatus, comment?: string) => void;
}

const ExigenceChecklist: React.FC<ExigenceChecklistProps> = ({ 
  item, 
  samplePages,
  importance,
  onItemChange 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [pageResults, setPageResults] = useState<Record<string, { 
    status: ComplianceStatus,
    comment: string
  }>>({});
  
  // Obtenir le badge de statut et sa couleur
  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.Compliant:
        return { label: 'Conforme', color: 'bg-green-100 text-green-800 hover:bg-green-200' };
      case ComplianceStatus.PartiallyCompliant:
        return { label: 'Partiellement conforme', color: 'bg-amber-100 text-amber-800 hover:bg-amber-200' };
      case ComplianceStatus.NonCompliant:
        return { label: 'Non conforme', color: 'bg-red-100 text-red-800 hover:bg-red-200' };
      default:
        return { label: 'Non évalué', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' };
    }
  };
  
  // Obtenez le badge d'importance et sa couleur
  const getImportanceBadge = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'majeur':
        return { color: 'bg-purple-100 text-purple-800' };
      case 'important':
        return { color: 'bg-indigo-100 text-indigo-800' };
      case 'moyen':
        return { color: 'bg-blue-100 text-blue-800' };
      case 'mineur':
        return { color: 'bg-teal-100 text-teal-800' };
      case 'n/a':
        return { color: 'bg-gray-100 text-gray-800' };
      default:
        return { color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const handlePageStatusChange = (pageId: string, status: ComplianceStatus) => {
    setPageResults(prev => ({
      ...prev,
      [pageId]: {
        status,
        comment: prev[pageId]?.comment || ''
      }
    }));
  };
  
  const handlePageCommentChange = (pageId: string, comment: string) => {
    setPageResults(prev => ({
      ...prev,
      [pageId]: {
        status: prev[pageId]?.status || ComplianceStatus.NotEvaluated,
        comment
      }
    }));
  };
  
  // Appliquer le même statut à toutes les pages
  const applyToAllPages = (status: ComplianceStatus) => {
    const newResults = { ...pageResults };
    
    samplePages.forEach(page => {
      newResults[page.id] = {
        status,
        comment: pageResults[page.id]?.comment || ''
      };
    });
    
    setPageResults(newResults);
  };
  
  // Calculer le statut global de l'item
  const calculateOverallStatus = () => {
    const statuses = Object.values(pageResults).map(r => r.status);
    
    if (statuses.length === 0) return ComplianceStatus.NotEvaluated;
    
    if (statuses.every(s => s === ComplianceStatus.Compliant)) {
      return ComplianceStatus.Compliant;
    }
    
    if (statuses.every(s => s === ComplianceStatus.NonCompliant)) {
      return ComplianceStatus.NonCompliant;
    }
    
    return ComplianceStatus.PartiallyCompliant;
  };
  
  const statusBadge = getStatusBadge(item.status);
  const importanceBadge = getImportanceBadge(importance);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={importanceBadge.color}>
                {importance}
              </Badge>
              <Badge className={statusBadge.color}>
                {statusBadge.label}
              </Badge>
            </div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
          
          <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
            <Button variant="ghost" size="icon">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-muted-foreground flex-grow">Appliquer à toutes les pages:</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                onClick={() => applyToAllPages(ComplianceStatus.Compliant)}
              >
                <Check size={14} />
                Conforme
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                onClick={() => applyToAllPages(ComplianceStatus.PartiallyCompliant)}
              >
                <AlertTriangle size={14} />
                Partiellement
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                onClick={() => applyToAllPages(ComplianceStatus.NonCompliant)}
              >
                <X size={14} />
                Non Conforme
              </Button>
            </div>
            
            <div className="space-y-4 mt-4">
              {samplePages.map(page => (
                <div key={page.id} className="border rounded-lg p-3">
                  <h3 className="font-medium mb-2">{page.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{page.url}</p>
                  
                  <RadioGroup 
                    className="flex items-center gap-4 mb-3"
                    value={pageResults[page.id]?.status || ComplianceStatus.NotEvaluated}
                    onValueChange={(value) => handlePageStatusChange(page.id, value as ComplianceStatus)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={ComplianceStatus.Compliant} id={`compliant-${page.id}`} />
                      <Label htmlFor={`compliant-${page.id}`} className="text-green-700 font-medium">Conforme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={ComplianceStatus.PartiallyCompliant} id={`partial-${page.id}`} />
                      <Label htmlFor={`partial-${page.id}`} className="text-amber-700 font-medium">Partiellement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={ComplianceStatus.NonCompliant} id={`non-compliant-${page.id}`} />
                      <Label htmlFor={`non-compliant-${page.id}`} className="text-red-700 font-medium">Non conforme</Label>
                    </div>
                  </RadioGroup>
                  
                  <Textarea 
                    placeholder="Commentaires sur cette page..."
                    className="text-sm"
                    value={pageResults[page.id]?.comment || ''}
                    onChange={(e) => handlePageCommentChange(page.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => onItemChange(
                  item.id, 
                  calculateOverallStatus(), 
                  Object.values(pageResults).map(r => r.comment).filter(Boolean).join(' | ')
                )}
                className="gap-2"
              >
                <Zap size={14} />
                Mettre à jour le statut global
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ExigenceChecklist;
