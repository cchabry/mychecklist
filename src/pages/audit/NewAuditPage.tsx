import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { auditsService } from '@/services/api/auditsService';
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';

const NewAuditPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [auditName, setAuditName] = useState('');
  const navigation = useNavigate();

  // Récupérer l'ID du projet depuis l'URL
  const projectId = window.location.pathname.split('/')[2];

  // Création d'un nouvel audit
  const createNewAudit = async (values: { name: string }) => {
    setIsCreating(true);

    try {
      // Ajouter un délai simulé en mode démo
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
      }

      // Créer l'audit via le service API
      const newAudit = await auditsService.create({
        name: values.name,
        projectId: projectId
      });

      // Afficher un message de succès
      toast.success(`Audit "${newAudit.name}" créé avec succès`);

      // Rediriger vers la page de l'audit
      navigation(`/audit/${newAudit.id}`);
    } catch (error) {
      // Afficher un message d'erreur
      toast.error(`Erreur lors de la création de l'audit: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const createAuditMutation = async (auditData: { name: string }) => {
    try {
      // Simuler un délai en mode démo
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
      }

      // Créer l'audit
      const newAudit = await auditsService.create({
        name: auditData.name,
        projectId: projectId
      });

      // Afficher un message de succès
      toast.success(`Audit "${newAudit.name}" créé avec succès`);

      // Rediriger vers la page de l'audit
      navigation(`/audit/${newAudit.id}`);
    } catch (error) {
      // Afficher un message d'erreur
      toast.error(`Erreur lors de la création de l'audit: ${error.message}`);
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
