
import React, { useState } from 'react';
import { 
  CheckSquare, 
  Circle, 
  Square, 
  AlertTriangle,
  ChevronDown,
  XCircle,
  Copy,
  ArrowRight,
  FileText,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuditItem, ComplianceStatus, ImportanceLevel, PageResult } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

interface SamplePage {
  id: string;
  url: string;
  title: string;
}

interface ExigenceChecklistProps {
  item: AuditItem;
  samplePages: SamplePage[];
  importance: string;
  onItemChange: (item: AuditItem) => void;
}

const ExigenceChecklist: React.FC<ExigenceChecklistProps> = ({ 
  item, 
  samplePages, 
  importance, 
  onItemChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [globalComment, setGlobalComment] = useState(item.comment || '');
  
  // Initialize page results if not present
  const initialPageResults = item.pageResults || samplePages.map(page => ({
    pageId: page.id,
    status: item.status || ComplianceStatus.NotEvaluated,
    comment: item.comment || ''
  }));

  const [pageResults, setPageResults] = useState<PageResult[]>(initialPageResults);

  // Calculate overall status from page results
  const calculateOverallStatus = (results: PageResult[]): ComplianceStatus => {
    if (results.length === 0) return ComplianceStatus.NotEvaluated;
    
    const statuses = results.map(r => r.status);
    
    if (statuses.every(s => s === ComplianceStatus.Compliant)) {
      return ComplianceStatus.Compliant;
    } else if (statuses.every(s => s === ComplianceStatus.NonCompliant)) {
      return ComplianceStatus.NonCompliant;
    } else if (statuses.every(s => s === ComplianceStatus.NotEvaluated)) {
      return ComplianceStatus.NotEvaluated;
    } else {
      return ComplianceStatus.PartiallyCompliant;
    }
  };
  
  // Update page result and recalculate overall status
  const handlePageStatusChange = (pageId: string, status: ComplianceStatus) => {
    const updatedResults = pageResults.map(result => 
      result.pageId === pageId ? { ...result, status } : result
    );
    
    setPageResults(updatedResults);
    
    const updatedItem = {
      ...item,
      pageResults: updatedResults,
      status: calculateOverallStatus(updatedResults)
    };
    
    onItemChange(updatedItem);
  };
  
  // Update page comment
  const handlePageCommentChange = (pageId: string, comment: string) => {
    const updatedResults = pageResults.map(result => 
      result.pageId === pageId ? { ...result, comment } : result
    );
    
    setPageResults(updatedResults);
    
    onItemChange({
      ...item,
      pageResults: updatedResults,
      status: calculateOverallStatus(updatedResults)
    });
  };
  
  // Apply status to all pages
  const applyStatusToAll = (status: ComplianceStatus) => {
    const updatedResults = pageResults.map(result => ({
      ...result,
      status
    }));
    
    setPageResults(updatedResults);
    
    onItemChange({
      ...item,
      pageResults: updatedResults,
      status
    });
    
    toast.success("Statut appliqué à toutes les pages", {
      description: "Le même statut a été appliqué à toutes les pages d'échantillon"
    });
  };
  
  // Apply comment to all pages
  const applyCommentToAll = (sourcePageId: string) => {
    const sourceComment = pageResults.find(r => r.pageId === sourcePageId)?.comment || '';
    
    const updatedResults = pageResults.map(result => ({
      ...result,
      comment: sourceComment
    }));
    
    setPageResults(updatedResults);
    
    onItemChange({
      ...item,
      pageResults: updatedResults,
      status: calculateOverallStatus(updatedResults)
    });
    
    toast.success("Notes appliquées à toutes les pages", {
      description: "Les mêmes notes ont été appliquées à toutes les pages d'échantillon"
    });
  };

  // Handle global comment change
  const handleGlobalCommentChange = (comment: string) => {
    setGlobalComment(comment);
    
    onItemChange({
      ...item,
      comment: comment
    });
  };
  
  // Fonction pour obtenir l'icône correspondant au statut
  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.Compliant:
        return <CheckSquare className="text-green-500" />;
      case ComplianceStatus.NonCompliant:
        return <XCircle className="text-red-500" />;
      case ComplianceStatus.PartiallyCompliant:
        return <AlertTriangle className="text-amber-500" />;
      case ComplianceStatus.NotEvaluated:
        return <Circle className="text-gray-400" />;
      default:
        return <Square className="text-gray-500" />;
    }
  };
  
  // Fonction pour obtenir la couleur du badge d'importance
  const getImportanceBadgeColor = () => {
    switch (importance) {
      case ImportanceLevel.Majeur:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case ImportanceLevel.Important:
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case ImportanceLevel.Moyen:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case ImportanceLevel.Mineur:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case ImportanceLevel.NA:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Get status for a specific page
  const getPageStatus = (pageId: string): ComplianceStatus => {
    return pageResults.find(r => r.pageId === pageId)?.status || ComplianceStatus.NotEvaluated;
  };
  
  // Get comment for a specific page
  const getPageComment = (pageId: string): string => {
    return pageResults.find(r => r.pageId === pageId)?.comment || '';
  };
  
  // Récupérer les données sur les exigences spécifiques au projet
  const projectRequirement = item.projectRequirement || "Cette exigence est importante pour le projet car elle impacte directement l'expérience utilisateur.";
  
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-start justify-between cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="mt-1">{getStatusIcon(item.status)}</div>
                <div>
                  <CardTitle className="text-base text-gray-900">{item.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getImportanceBadgeColor()}`}>
                      {importance}
                    </Badge>
                    {item.requirementLevel && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                        {item.requirementLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Description de l'item */}
                <div>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {item.details || "Description non disponible"}
                  </p>
                </div>
                
                {/* Exigences spécifiques au projet - Toujours visible et pas dans un accordéon */}
                <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-900">Exigences spécifiques au projet</h3>
                    <Badge className={`text-xs ${getImportanceBadgeColor()}`}>
                      Importance: {importance}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-blue-800 mb-3">{projectRequirement}</p>
                </div>
                
                {/* Champ de commentaire global */}
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Commentaire global</h3>
                    <span className="text-xs text-gray-500">
                      {globalComment.length}/255
                    </span>
                  </div>
                  <Textarea
                    placeholder="Ajouter un commentaire global concernant cette exigence..."
                    className="resize-none text-sm"
                    value={globalComment}
                    onChange={(e) => handleGlobalCommentChange(e.target.value)}
                    maxLength={255}
                  />
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Actions rapides:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-green-700 border-green-200 hover:bg-green-50"
                      onClick={() => applyStatusToAll(ComplianceStatus.Compliant)}
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span>Tous conformes</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                      onClick={() => applyStatusToAll(ComplianceStatus.PartiallyCompliant)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Tous partiellement conformes</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => applyStatusToAll(ComplianceStatus.NonCompliant)}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Tous non conformes</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-gray-700 border-gray-200 hover:bg-gray-50"
                      onClick={() => applyStatusToAll(ComplianceStatus.NotEvaluated)}
                    >
                      <Circle className="h-4 w-4" />
                      <span>Tous non applicables</span>
                    </Button>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="border rounded-md overflow-hidden">
                  <AccordionItem value="pages" className="border-0">
                    <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                      <span className="text-sm font-medium">Pages à tester</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <div className="space-y-4 p-4">
                        {samplePages.map(page => (
                          <div 
                            key={page.id}
                            className="p-4 bg-gray-50 rounded-md"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{page.title}</span>
                                <a 
                                  href={page.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  Ouvrir
                                </a>
                              </div>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(getPageStatus(page.id))}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <h5 className="text-sm font-medium mb-1">Statut:</h5>
                              <RadioGroup 
                                value={getPageStatus(page.id)} 
                                onValueChange={(value) => handlePageStatusChange(page.id, value as ComplianceStatus)}
                                className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem id={`compliant-${page.id}`} value={ComplianceStatus.Compliant} />
                                  <Label 
                                    htmlFor={`compliant-${page.id}`}
                                    className="text-sm text-green-700 cursor-pointer"
                                  >
                                    Conforme
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem id={`partially_compliant-${page.id}`} value={ComplianceStatus.PartiallyCompliant} />
                                  <Label 
                                    htmlFor={`partially_compliant-${page.id}`}
                                    className="text-sm text-amber-700 cursor-pointer"
                                  >
                                    Partiellement
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem id={`non_compliant-${page.id}`} value={ComplianceStatus.NonCompliant} />
                                  <Label 
                                    htmlFor={`non_compliant-${page.id}`}
                                    className="text-sm text-red-700 cursor-pointer"
                                  >
                                    Non conforme
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem id={`not_evaluated-${page.id}`} value={ComplianceStatus.NotEvaluated} />
                                  <Label 
                                    htmlFor={`not_evaluated-${page.id}`}
                                    className="text-sm text-gray-700 cursor-pointer"
                                  >
                                    Non applicable
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <h5 className="text-sm font-medium">Notes:</h5>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Appliquer ces notes à toutes les pages"
                                    onClick={() => applyCommentToAll(page.id)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs text-gray-500">
                                    {getPageComment(page.id).length}/255
                                  </span>
                                </div>
                              </div>
                              <Textarea
                                placeholder="Ajouter des observations ou des explications..."
                                className="resize-none text-sm"
                                value={getPageComment(page.id)}
                                onChange={(e) => handlePageCommentChange(page.id, e.target.value)}
                                maxLength={255}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default ExigenceChecklist;
