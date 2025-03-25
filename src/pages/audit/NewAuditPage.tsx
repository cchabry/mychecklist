
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { notionWriteService } from '@/services/notion/notionWriteService';
import { useNotionRequestLogger } from '@/hooks/useNotionRequestLogger';
import { operationModeUtils } from '@/services/operationMode/utils';
import { operationMode } from '@/services/operationMode';

const NewAuditPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [auditName, setAuditName] = useState('');
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  // Activer l'interception des requêtes Notion
  useNotionRequestLogger();

  // Vérifier que nous avons bien un ID de projet
  if (!projectId) {
    toast.error("ID de projet manquant");
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>Impossible de créer un audit sans projet associé</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Création d'un nouvel audit
  const createNewAudit = async (values: { name: string }) => {
    if (!values.name.trim()) {
      toast.error("Le nom de l'audit est requis");
      return;
    }
    
    setIsCreating(true);

    try {
      // Ajouter un délai simulé en mode démo
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
      }

      // Créer l'audit via le service d'écriture Notion directement
      const newAudit = await notionWriteService.createAudit({
        name: values.name,
        projectId: projectId
      });

      if (newAudit) {
        // Afficher un message de succès
        toast.success(`Audit "${values.name}" créé avec succès`);

        // Rediriger vers la page de l'audit
        navigate(`/audit/${projectId}/${newAudit.id}`);
      } else {
        throw new Error("Échec de la création de l'audit");
      }
    } catch (error: any) {
      // Afficher un message d'erreur
      toast.error(`Erreur lors de la création de l'audit: ${error.message || 'Erreur inconnue'}`);
      console.error("Erreur création audit:", error);
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
            onClick={() => createNewAudit({ name: auditName })}
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
