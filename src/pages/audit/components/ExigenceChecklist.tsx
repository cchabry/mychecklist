
import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  AuditItem,
  ImportanceLevel,
  ComplianceStatus,
  SamplePage,
  PageResult
} from '@/lib/types';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react';
import ChecklistItemTags from '@/components/ChecklistItemTags';
import PageEvaluationList from './PageEvaluationList';
import CorrectiveActionsList from './CorrectiveActionsList';
import { getComplianceStatusColor, calculateOverallStatus } from '../utils/complianceUtils';

interface ExigenceChecklistProps {
  item: AuditItem;
  samplePages: SamplePage[];
  importance: ImportanceLevel | string;
  onItemChange: (item: AuditItem) => void;
}

const ExigenceChecklist: React.FC<ExigenceChecklistProps> = ({
  item,
  samplePages,
  importance,
  onItemChange
}) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Calculer le statut global basé sur les résultats par page
  const overallStatus = calculateOverallStatus(
    item.pageResults || [],
    importance
  );
  
  // Mettre à jour les résultats par page
  const handleUpdatePageResults = (pageResults: PageResult[]) => {
    const updatedItem = {
      ...item,
      pageResults,
      // Mettre à jour le statut global de l'item
      status: calculateOverallStatus(pageResults, importance)
    };
    
    onItemChange(updatedItem);
  };
  
  // Icon for status
  const StatusIcon = () => {
    switch (overallStatus) {
      case ComplianceStatus.Compliant:
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case ComplianceStatus.PartiallyCompliant:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case ComplianceStatus.NonCompliant:
        return <X className="h-5 w-5 text-red-500" />;
      case ComplianceStatus.NotApplicable:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={item.id} className="border rounded-lg p-1">
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <StatusIcon />
            <div className="flex-1 text-left">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.category} / {item.subcategory}</p>
            </div>
            <Badge 
              variant="outline"
              className="ml-auto"
              style={{ 
                backgroundColor: getComplianceStatusColor(overallStatus, "bg"),
                color: getComplianceStatusColor(overallStatus, "text")
              }}
            >
              {overallStatus}
            </Badge>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-4 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="evaluation">Évaluation</TabsTrigger>
              <TabsTrigger value="actions">Actions correctives</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mr-2">
                      Importance: {importance}
                    </Badge>
                    {/* Passer seulement les propriétés nécessaires à ChecklistItemTags */}
                    <ChecklistItemTags 
                      metaRefs={item.metaRefs}
                      criteria={item.criteria}
                      profile={item.profile}
                      phase={item.phase}
                      effort={item.effort}
                      priority={item.priority}
                      requirementLevel={item.requirementLevel}
                      scope={item.scope}
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    
                    {item.details && (
                      <div>
                        <h4 className="font-medium mb-1">Détails</h4>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                    )}
                    
                    {item.metaRefs && (
                      <div>
                        <h4 className="font-medium mb-1">Références</h4>
                        <p className="text-sm text-muted-foreground">{item.metaRefs}</p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-1">Exigence du projet</h4>
                      <p className="text-sm text-muted-foreground">{item.projectRequirement || "Aucune exigence spécifique définie pour ce projet."}</p>
                    </div>
                    
                    {item.projectComment && (
                      <div>
                        <h4 className="font-medium mb-1">Commentaire du projet</h4>
                        <p className="text-sm text-muted-foreground">{item.projectComment}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluation" className="mt-0">
              <PageEvaluationList
                item={item}
                pages={samplePages}
                onUpdatePageResults={handleUpdatePageResults}
              />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0">
              <CorrectiveActionsList
                actions={item.actions || []}
                pages={samplePages}
                onAddAction={() => {
                  // À implémenter
                  console.log("Ajouter une action corrective");
                }}
                onEditAction={(action) => {
                  // À implémenter
                  console.log("Modifier l'action", action.id);
                }}
                onDeleteAction={(actionId) => {
                  // À implémenter
                  console.log("Supprimer l'action", actionId);
                }}
              />
            </TabsContent>
          </Tabs>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ExigenceChecklist;
