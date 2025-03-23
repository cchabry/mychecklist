
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, RefreshCw } from "lucide-react";
import { useOperationModeListener } from '@/hooks/useOperationModeListener';
import { operationMode } from '@/services/operationMode';
import { useProjects } from '@/hooks/api';
import { useAudits } from '@/hooks/api';

/**
 * Page de diagnostics pour tester le cache API
 */
const ApiCacheDiagnostics: React.FC = () => {
  const { isDemoMode } = useOperationModeListener();
  const [skipCache, setSkipCache] = useState(false);
  
  // Utiliser les hooks avec cache
  const { 
    data: projects, 
    isLoading: isProjectsLoading, 
    refetch: refetchProjects 
  } = useProjects(undefined, { 
    enabled: true,
    skipCache: skipCache
  });
  
  const { 
    data: audits, 
    isLoading: isAuditsLoading, 
    refetch: refetchAudits 
  } = useAudits(undefined, { 
    enabled: true,
    skipCache: skipCache
  });
  
  const handleToggleMode = () => {
    if (isDemoMode) {
      operationMode.enableRealMode();
    } else {
      operationMode.enableDemoMode();
    }
  };
  
  const handleToggleSkipCache = () => {
    setSkipCache(!skipCache);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics du Cache API</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant={isDemoMode ? "default" : "outline"} 
            onClick={handleToggleMode}
          >
            {isDemoMode ? "Mode Démo Actif" : "Mode Réel Actif"}
          </Button>
          
          <Button 
            variant={skipCache ? "destructive" : "outline"} 
            onClick={handleToggleSkipCache}
          >
            {skipCache ? "Cache Désactivé" : "Cache Activé"}
          </Button>
        </div>
      </div>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Comment utiliser cette page</AlertTitle>
        <AlertDescription>
          Cette page vous permet de tester les hooks API avec cache. Vous pouvez basculer entre 
          le mode démo et réel, activer ou désactiver le cache, et voir les résultats des appels API.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="projects">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projets</CardTitle>
                <CardDescription>Données des projets avec cache</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchProjects()} 
                disabled={isProjectsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProjectsLoading ? 'animate-spin' : ''}`} />
                Recharger
              </Button>
            </CardHeader>
            <CardContent>
              {isProjectsLoading ? (
                <div className="py-6 text-center text-gray-500">Chargement...</div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    {projects.length} projet(s) trouvé(s)
                  </p>
                  <ul className="space-y-2">
                    {projects.map(project => (
                      <li key={project.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.url}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  Aucun projet trouvé
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audits">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audits</CardTitle>
                <CardDescription>Données des audits avec cache</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchAudits()} 
                disabled={isAuditsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAuditsLoading ? 'animate-spin' : ''}`} />
                Recharger
              </Button>
            </CardHeader>
            <CardContent>
              {isAuditsLoading ? (
                <div className="py-6 text-center text-gray-500">Chargement...</div>
              ) : audits && audits.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    {audits.length} audit(s) trouvé(s)
                  </p>
                  <ul className="space-y-2">
                    {audits.map(audit => (
                      <li key={audit.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="font-medium">{audit.name}</div>
                        <div className="text-sm text-gray-500">Projet: {audit.projectId}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  Aucun audit trouvé
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiCacheDiagnostics;
