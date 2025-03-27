
# Exemples d'utilisation de la nouvelle infrastructure Notion

Ce document fournit des exemples concrets d'utilisation de la nouvelle architecture Notion pour différents cas d'usage.

## Exemple 1: Récupération et affichage des projets

```tsx
import { useState, useEffect } from 'react';
import { useNotionErrorHandler } from '@/hooks/notion/useNotionErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { projectsApi } from '@/services/notion/api/projects';
import { Project } from '@/types/domain';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleNotionError } = useNotionErrorHandler();
  
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (error) {
        handleNotionError(error, {
          toastTitle: 'Erreur de chargement',
          description: 'Impossible de charger les projets',
          endpoint: '/projects'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProjects();
  }, [handleNotionError]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{project.url}</p>
            <p className="mt-2">
              Progrès: {project.progress || 0}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Exemple 2: Création d'un nouvel audit

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotionErrorHandler } from '@/hooks/notion/useNotionErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { auditsApi } from '@/services/notion/api/audits';
import { toast } from 'sonner';

export function CreateAuditForm({ projectId }: { projectId: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { handleNotionError } = useNotionErrorHandler();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name) {
      toast.error('Erreur de validation', {
        description: 'Le nom de l\'audit est requis'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const auditData = {
        projectId,
        name,
        description,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const audit = await auditsApi.createAudit(auditData);
      
      toast.success('Audit créé', {
        description: `L'audit "${name}" a été créé avec succès`
      });
      
      navigate(`/projects/${projectId}/audits/${audit.id}`);
    } catch (error) {
      handleNotionError(error, {
        toastTitle: 'Erreur de création',
        description: 'Impossible de créer l\'audit',
        endpoint: '/audits'
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'audit</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Audit initial"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Objectifs et contexte de l'audit..."
          rows={4}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Création en cours...' : 'Créer l\'audit'}
      </Button>
    </form>
  );
}
```

## Exemple 3: Utilisation d'un custom hook avec la nouvelle API

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useNotionErrorHandler } from '@/hooks/notion/useNotionErrorHandler';
import { Exigence } from '@/types/domain';
import { exigencesApi } from '@/services/notion/api/exigences';

export function useExigences(projectId: string) {
  const [exigences, setExigences] = useState<Exigence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { handleNotionError } = useNotionErrorHandler();
  
  const fetchExigences = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await exigencesApi.getExigences(projectId);
      setExigences(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      handleNotionError(err, {
        toastTitle: 'Erreur de chargement',
        description: 'Impossible de charger les exigences',
        endpoint: '/exigences'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, handleNotionError]);
  
  useEffect(() => {
    fetchExigences();
  }, [fetchExigences]);
  
  const createExigence = useCallback(async (exigenceData: any) => {
    try {
      const newExigence = await exigencesApi.createExigence({
        ...exigenceData,
        projectId
      });
      
      setExigences((prev) => [...prev, newExigence]);
      return newExigence;
    } catch (error) {
      handleNotionError(error, {
        toastTitle: 'Erreur de création',
        description: 'Impossible de créer l\'exigence',
        endpoint: '/exigences'
      });
      return null;
    }
  }, [projectId, handleNotionError]);
  
  const updateExigence = useCallback(async (id: string, data: Partial<Exigence>) => {
    try {
      const exigence = exigences.find(e => e.id === id);
      if (!exigence) throw new Error('Exigence non trouvée');
      
      const updatedExigence = await exigencesApi.updateExigence({
        ...exigence,
        ...data
      });
      
      setExigences(prev => 
        prev.map(e => e.id === id ? updatedExigence : e)
      );
      
      return updatedExigence;
    } catch (error) {
      handleNotionError(error, {
        toastTitle: 'Erreur de mise à jour',
        description: 'Impossible de mettre à jour l\'exigence',
        endpoint: '/exigences'
      });
      return null;
    }
  }, [exigences, handleNotionError]);
  
  const deleteExigence = useCallback(async (id: string) => {
    try {
      const success = await exigencesApi.deleteExigence(id);
      
      if (success) {
        setExigences(prev => prev.filter(e => e.id !== id));
      }
      
      return success;
    } catch (error) {
      handleNotionError(error, {
        toastTitle: 'Erreur de suppression',
        description: 'Impossible de supprimer l\'exigence',
        endpoint: '/exigences'
      });
      return false;
    }
  }, [handleNotionError]);
  
  return {
    exigences,
    isLoading,
    error,
    refetch: fetchExigences,
    createExigence,
    updateExigence,
    deleteExigence
  };
}
```

## Exemple 4: Configuration complète du service Notion

```tsx
import { useEffect, useState } from 'react';
import { useNotionService } from '@/hooks/notion/useNotionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatus } from '@/services/notion/types';

export function NotionConfigForm() {
  const { 
    isConfigured, 
    connectionStatus, 
    isLoading, 
    setNotionConfig, 
    testConnection, 
    getConfig 
  } = useNotionService();
  
  const [apiKey, setApiKey] = useState('');
  const [projectsDbId, setProjectsDbId] = useState('');
  const [checklistsDbId, setChecklistsDbId] = useState('');
  
  // Charger la configuration initiale
  useEffect(() => {
    if (isConfigured) {
      const config = getConfig();
      setApiKey(config.apiKey || '');
      setProjectsDbId(config.projectsDbId || '');
      setChecklistsDbId(config.checklistsDbId || '');
    }
  }, [isConfigured, getConfig]);
  
  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    
    if (!apiKey || !projectsDbId) {
      return;
    }
    
    const success = setNotionConfig(apiKey, projectsDbId, checklistsDbId);
    
    if (success) {
      const result = await testConnection();
      console.log('Test de connexion:', result);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Notion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Clé API Notion</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="secret_..."
              required
            />
            <p className="text-xs text-gray-500">
              Clé API utilisée pour accéder à l'API Notion
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectsDbId">ID Base de données Projets</Label>
            <Input
              id="projectsDbId"
              value={projectsDbId}
              onChange={(e) => setProjectsDbId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="checklistsDbId">ID Base de données Checklist</Label>
            <Input
              id="checklistsDbId"
              value={checklistsDbId}
              onChange={(e) => setChecklistsDbId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                Statut: {
                  connectionStatus === ConnectionStatus.Connected
                    ? '🟢 Connecté'
                    : connectionStatus === ConnectionStatus.Error
                    ? '🔴 Erreur de connexion'
                    : '⚪ Non connecté'
                }
              </p>
            </div>
            
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => testConnection()}
                disabled={isLoading || !isConfigured}
              >
                Tester la connexion
              </Button>
              
              <Button 
                type="submit" 
                disabled={isLoading || !apiKey || !projectsDbId}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Exemple 5: Utilisation du mode opérationnel avec des données conditionnelles

```tsx
import { useOperationMode } from '@/hooks/useOperationMode';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DemoModeIndicator() {
  const { 
    isDemoMode, 
    isRealMode, 
    enableDemoMode, 
    enableRealMode,
    demoReason
  } = useOperationMode();
  
  function handleToggleMode() {
    if (isDemoMode) {
      enableRealMode();
    } else {
      enableDemoMode('Basculement manuel par l\'utilisateur');
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Mode d'opération
          {isDemoMode && (
            <Badge className="ml-2 bg-amber-500">Démo</Badge>
          )}
          {isRealMode && (
            <Badge className="ml-2 bg-green-500">Réel</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isDemoMode && (
          <div className="space-y-2">
            <p>Vous êtes en mode démonstration. Les données affichées sont simulées.</p>
            {demoReason && (
              <p className="text-sm text-gray-500">
                Raison: {demoReason}
              </p>
            )}
          </div>
        )}
        
        {isRealMode && (
          <p>Vous êtes en mode réel. L'application utilise l'API Notion pour les données.</p>
        )}
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleToggleMode} variant="outline">
          {isDemoMode ? 'Basculer en mode réel' : 'Basculer en mode démo'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

Ces exemples illustrent l'utilisation de la nouvelle infrastructure dans différents contextes. Ils peuvent être adaptés selon les besoins spécifiques de votre application.
