
import React, { useState } from 'react';
import { 
  CheckSquare, 
  Circle, 
  Square, 
  AlertTriangle,
  ChevronDown,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AuditItem, ComplianceStatus } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [notes, setNotes] = useState(item.comment || '');
  const [status, setStatus] = useState<ComplianceStatus>(item.status || ComplianceStatus.NotEvaluated);
  
  const handleStatusChange = (newStatus: ComplianceStatus) => {
    setStatus(newStatus);
    onItemChange({
      ...item,
      status: newStatus,
      comment: notes
    });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onItemChange({
      ...item,
      comment: e.target.value
    });
  };
  
  // Fonction pour obtenir l'icône correspondant au statut
  const getStatusIcon = () => {
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
      case 'Majeur':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Important':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'Moyen':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Mineur':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="mt-1">{getStatusIcon()}</div>
              <div>
                <CardTitle className="text-base text-gray-900">{item.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getImportanceBadgeColor()}`}>
                    {importance}
                  </Badge>
                </div>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {item.details || "Description non disponible"}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Statut:</h4>
                  <RadioGroup 
                    value={status} 
                    onValueChange={(value) => handleStatusChange(value as ComplianceStatus)}
                    className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`compliant-${item.id}`} value={ComplianceStatus.Compliant} />
                      <Label 
                        htmlFor={`compliant-${item.id}`}
                        className="text-sm text-green-700 cursor-pointer"
                      >
                        Conforme
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`non_compliant-${item.id}`} value={ComplianceStatus.NonCompliant} />
                      <Label 
                        htmlFor={`non_compliant-${item.id}`}
                        className="text-sm text-red-700 cursor-pointer"
                      >
                        Non conforme
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`partially_compliant-${item.id}`} value={ComplianceStatus.PartiallyCompliant} />
                      <Label 
                        htmlFor={`partially_compliant-${item.id}`}
                        className="text-sm text-amber-700 cursor-pointer"
                      >
                        Partiellement conforme
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`not_evaluated-${item.id}`} value={ComplianceStatus.NotEvaluated} />
                      <Label 
                        htmlFor={`not_evaluated-${item.id}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Non applicable
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Notes:</h4>
                    <span className="text-xs text-gray-500">
                      {notes.length}/255
                    </span>
                  </div>
                  <Textarea
                    placeholder="Ajouter des observations ou des explications..."
                    className="resize-none"
                    value={notes}
                    onChange={handleNotesChange}
                    maxLength={255}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Pages à tester:</h4>
                  <div className="space-y-2">
                    {samplePages.map(page => (
                      <div 
                        key={page.id}
                        className="p-2 bg-gray-50 rounded-md text-sm flex justify-between items-center"
                      >
                        <span className="font-medium">{page.title}</span>
                        <a 
                          href={page.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Ouvrir
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default ExigenceChecklist;
