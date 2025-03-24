
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { auditsService } from '@/services/api/auditsService';
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';
import { useNotion } from '@/contexts/NotionContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const NewAuditPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [auditName, setAuditName] = useState('');
  const navigation = useNavigate();
  const { usingNotion, config } = useNotion();

  // Récupérer l'ID du projet depuis l'URL
  const projectId = window.location.pathname.split('/')[2];
  
  // État pour vérifier si la base de données des audits est configurée
  const [auditsDbConfigured, setAuditsDbConfigured] = useState(true);
  
  // Vérifier si la base de données des audits est configurée
  useEffect(() => {
    const auditsDbId = localStorage.getItem('notion_audits_database_id');
    setAuditsDbConfigured(!!auditsDbId);
  }, []);

  // Création d'un nouvel audit
  const createNewAudit = async () => {
    if (!auditName.trim()) {
      toast.error("Veuillez entrer un nom pour l'audit");
      return;
    }
    
    setIsCreating(true);

    try {
      console.log(`Création d'un audit : ${auditName} pour le projet ${projectId}`);
      console.log(`Mode démo: ${operationMode.isDemoMode}, Using Notion: ${usingNotion}`);
      
      // Vérifier si la base de données des audits est configurée en mode Notion
      if (usingNotion && !operationMode.isDemoMode) {
        const auditsDbId = localStorage.getItem('notion_audits_database_id');
        console.log(`Base de données des audits configurée: ${!!auditsDbId}`);
        
        if (!auditsDbId) {
          toast.warning("Base de données des audits non configurée", {
            description: "L'application utilisera le mode démonstration pour cette fonctionnalité."
          });
          // Force demo mode for this operation only
          operationMode.temporarilyActivateDemoMode();
        }
      }

      // Ajouter un délai simulé en mode démo
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
      }

      // Créer l'audit via le service API
      const newAudit = await auditsService.create({
        name: auditName,
        projectId: projectId
      });

      // Afficher un message de succès
      toast.success(`Audit "${newAudit.name}" créé avec succès`);

      // Rediriger vers la page de l'audit
      navigation(`/audit/${newAudit.id}`);
    } catch (error) {
      console.error("Erreur détaillée:", error);
      
      // Afficher un message d'erreur
      toast.error(`Erreur lors de la création de l'audit`, {
        description: error.message || "Erreur inconnue lors de la création"
      });
      
      // Activer le mode démo en cas d'erreur persistante
      if (!operationMode.isDemoMode) {
        operationMode.handleConnectionError(
          error, 
          "Création d'audit"
        );
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Créer un nouvel audit</CardTitle>
          <CardDescription>Entrez le nom de l'audit à créer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {usingNotion && !operationMode.isDemoMode && !auditsDbConfigured && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Base de données manquante</AlertTitle>
                <AlertDescription>
                  La base de données des audits n'est pas configurée dans Notion. 
                  L'application utilisera le mode démonstration pour cette fonctionnalité.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'audit</Label>
              <Input
                id="name"
                placeholder="Nom de l'audit"
                type="text"
                value={auditName}
                onChange={(e) => setAuditName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={createNewAudit}
            disabled={isCreating}
          >
            {isCreating ? "Création..." : "Créer l'audit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewAuditPage;
