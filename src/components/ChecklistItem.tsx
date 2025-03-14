
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AuditItem, ComplianceStatus, COMPLIANCE_VALUES } from '@/lib/types';
import { Check, X, Minus } from 'lucide-react';

interface ChecklistItemProps {
  item: AuditItem;
  onChange: (itemId: string, status: ComplianceStatus, comment?: string) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onChange }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState(item.comment || '');
  
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    onChange(item.id, item.status, e.target.value);
  };
  
  const handleStatusChange = (status: ComplianceStatus) => {
    onChange(item.id, status, comment);
  };
  
  return (
    <Card className={`mb-4 overflow-hidden border transition-all duration-300 ${
      item.status === ComplianceStatus.NotEvaluated ? 'border-border/60' :
      item.status === ComplianceStatus.Compliant ? 'border-success/30' :
      item.status === ComplianceStatus.PartiallyCompliant ? 'border-warning/30' :
      'border-error/30'
    }`}>
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-block text-xs font-medium px-2.5 py-1 bg-secondary/80 rounded-full mb-2">
                {item.category}
              </span>
              <h3 className="text-lg font-medium">{item.title}</h3>
            </div>
            
            <div className={`text-xs font-medium rounded-full px-3 py-1 flex items-center
              ${item.status === ComplianceStatus.NotEvaluated ? 'bg-secondary text-muted-foreground' :
                item.status === ComplianceStatus.Compliant ? 'bg-success/10 text-success' :
                item.status === ComplianceStatus.PartiallyCompliant ? 'bg-warning/10 text-warning' :
                'bg-error/10 text-error'
              }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 
                ${item.status === ComplianceStatus.NotEvaluated ? 'bg-muted-foreground' :
                  item.status === ComplianceStatus.Compliant ? 'bg-success' :
                  item.status === ComplianceStatus.PartiallyCompliant ? 'bg-warning' :
                  'bg-error'
                }`}></span>
              {item.status === ComplianceStatus.NotEvaluated ? 'Non évalué' :
                item.status === ComplianceStatus.Compliant ? 'Conforme' :
                item.status === ComplianceStatus.PartiallyCompliant ? 'Partiellement conforme' :
                'Non conforme'}
            </div>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {item.description}
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline"
              size="sm"
              className={`transition-all duration-200 ${
                item.status === ComplianceStatus.NonCompliant 
                  ? 'bg-error/10 text-error border-error/30 hover:bg-error/20' 
                  : 'hover:bg-error/10 hover:text-error hover:border-error/30'
              }`}
              onClick={() => handleStatusChange(ComplianceStatus.NonCompliant)}
            >
              <X size={16} className="mr-1.5" />
              Non conforme
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className={`transition-all duration-200 ${
                item.status === ComplianceStatus.PartiallyCompliant 
                  ? 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20' 
                  : 'hover:bg-warning/10 hover:text-warning hover:border-warning/30'
              }`}
              onClick={() => handleStatusChange(ComplianceStatus.PartiallyCompliant)}
            >
              <Minus size={16} className="mr-1.5" />
              Partiellement
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className={`transition-all duration-200 ${
                item.status === ComplianceStatus.Compliant 
                  ? 'bg-success/10 text-success border-success/30 hover:bg-success/20' 
                  : 'hover:bg-success/10 hover:text-success hover:border-success/30'
              }`}
              onClick={() => handleStatusChange(ComplianceStatus.Compliant)}
            >
              <Check size={16} className="mr-1.5" />
              Conforme
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            {showComments ? 'Masquer les commentaires' : 'Ajouter un commentaire'}
          </Button>
        </div>
        
        {showComments && (
          <div className="p-4 bg-secondary/40 border-t border-border/40">
            <Textarea
              placeholder="Ajoutez des notes ou commentaires concernant ce critère..."
              className="min-h-[100px] text-sm"
              value={comment}
              onChange={handleCommentChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistItem;
