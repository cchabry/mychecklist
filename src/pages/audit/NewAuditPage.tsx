
import React, { useState, useEffect } from 'react';
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
import { notionApi } from '@/lib/notionProxy';
import { cleanProjectId } from '@/lib/utils';

const NewAuditPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [auditName, setAuditName] = useState('');
  const [projectExists, setProjectExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [project, setProject] = useState<any>(null);
  const navigate = useNavigate();
  const { projectId: rawProjectId } = useParams<{ projectId: string }>();
  
  // Nettoyer l'ID du projet pour la cohérence
  const projectId = rawProjectId ? cleanProjectId(rawProjectId) : '';
  
  // Activer l'interception des requêtes Notion
  useNotionRequestLogger();

  // Vérifier que le projet existe
  useEffect(() => {
    const checkProjectExists = async () => {
      if (!projectId) {
        setProjectExists(false);
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        console.log(`🔍 NewAuditPage - Vérification de l'existence du projet: "${projectId}"`);
        
        // Vérifier si c'est un projet récemment créé
        const recentlyCreatedProjectId = localStorage.getItem('recently_created_project_id');
        const isRecentlyCreated = recentlyCreatedProjectId === projectId;
        
        if (isRecentlyCreated) {
          console.log('🔍 NewAuditPage - Projet récemment créé détecté:', projectId);
          
          // Récupérer les données du projet depuis le localStorage
          const storedProjectData = localStorage.getItem(`project_data_${projectId}`);
          if (storedProjectData) {
            const projectData = JSON.parse(storedProjectData);
            console.log('📦 Utilisation des données du projet depuis localStorage:', projectData);
            setProject(projectData);
            setProjectExists(true);
            
            // Définir un nom d'audit par défaut basé sur le nom du projet
            setAuditName(`Audit ${projectData.name} - ${new Date().toLocaleDateString('fr-FR')}`);
            setIsChecking(false);
            return;
          }
        }
        
        // Si pas de données en cache, vérifier via l'API
        console.log('🔍 NewAuditPage - Vérification via API pour le projet:', projectId);
        
        // Conserver le mode actuel
        const isDemoModeActive = operationMode.isDemoMode;
        
        // Si c'est un projet récemment créé, s'assurer qu'on reste en mode réel
        if (isRecentlyCreated && isDemoModeActive) {
          console.log('🔍 NewAuditPage - Forçage du mode réel pour un projet récemment créé');
          operationMode.temporarilyForceReal();
        }
        
        // Vérifier directement via l'API
        const projectData = await notionApi.getProject(projectId);
        console.log('Résultat de la vérification du projet:', projectData);
        
        if (projectData) {
          setProject(projectData);
          setProjectExists(true);
          
          // Définir un nom d'audit par défaut basé sur le nom du projet
          setAuditName(`Audit ${projectData.name} - ${new Date().toLocaleDateString('fr-FR')}`);
          
          // Sauvegarder les données du projet pour référence future
          localStorage.setItem(`project_data_${projectId}`, JSON.stringify(projectData));
        } else {
          setProjectExists(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du projet:', error);
        setProjectExists(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkProjectExists();
  }, [projectId]);

  // Vérifier que nous avons bien un ID de projet
  if (isChecking) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Vérification du projet</CardTitle>
            <CardDescription>Veuillez patienter pendant que nous vérifions le projet...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!projectId || projectExists === false) {
    toast.error("Projet introuvable");
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>Impossible de créer un audit sans projet associé</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 rounded-md border border-red-200 text-sm text-red-700 mb-4">
              <p><strong>Détails :</strong> Le projet avec l'ID <code>{projectId}</code> n'a pas été trouvé.</p>
              <p className="mt-1">Veuillez vérifier que le projet existe et que vous avez les permissions nécessaires.</p>
            </div>
          </CardContent>
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
      console.log(`🔍 NewAuditPage - Création d'un audit pour le projet ID: "${projectId}"`);
      const newAudit = await notionWriteService.createAudit({
        name: values.name,
        projectId: projectId
      });

      if (newAudit) {
        // Afficher un message de succès
        toast.success(`Audit "${values.name}" créé avec succès`);
        console.log('Nouvel audit créé:', newAudit);

        // Vider le cache des audits pour forcer un rechargement
        localStorage.removeItem('audit_cache');
        
        // Attendre un court instant avant de rediriger
        setTimeout(() => {
          // Rediriger vers la page de l'audit
          navigate(`/audit/${projectId}/${newAudit.id}`);
        }, 500);
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
          <CardDescription>
            {project ? (
              <>Création d'un audit pour le projet <strong>{project.name}</strong></>
            ) : (
              <>Entrez le nom de l'audit à créer</>
            )}
          </CardDescription>
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
