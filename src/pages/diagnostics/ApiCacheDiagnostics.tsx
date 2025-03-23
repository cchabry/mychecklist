
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects, useActiveProjects } from '@/hooks/api';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';

const ApiCacheDiagnostics: React.FC = () => {
  const { isDemoMode, toggleMode } = useOperationModeListener();
  
  // Utiliser nos hooks avec cache
  const { 
    data: allProjects, 
    isLoading: isLoadingAll,
    refetch: refetchAll
  } = useProjects();
  
  const { 
    data: activeProjects, 
    isLoading: isLoadingActive,
    refetch: refetchActive
  } = useActiveProjects();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostics d'API avec Cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => refetchAll()} disabled={isLoadingAll}>
                {isLoadingAll ? 'Chargement...' : 'Recharger tous les projets'}
              </Button>
              <Button onClick={() => refetchActive()} disabled={isLoadingActive}>
                {isLoadingActive ? 'Chargement...' : 'Recharger projets actifs'}
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-md">
              <h3 className="font-semibold mb-2">Mode opérationnel</h3>
              <p><span className="font-medium">Mode démo:</span> {isDemoMode ? 'Activé' : 'Désactivé'}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={toggleMode}>
                {isDemoMode ? 'Passer en mode réel' : 'Passer en mode démo'}
              </Button>
            </div>

            {allProjects && (
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">Tous les projets ({allProjects.length})</h3>
                <ul className="list-disc list-inside">
                  {allProjects.map(project => (
                    <li key={project.id}>{project.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeProjects && (
              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="font-semibold mb-2">Projets actifs ({activeProjects.length})</h3>
                <ul className="list-disc list-inside">
                  {activeProjects.map(project => (
                    <li key={project.id}>{project.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-amber-50 rounded-md">
              <h3 className="font-semibold mb-2">Info</h3>
              <p className="text-sm">
                Ce composant utilise les hooks personnalisés <code>useProjects</code> et <code>useActiveProjects</code> qui
                intègrent le système de cache et la gestion du mode opérationnel.
              </p>
              <p className="text-sm mt-2">
                En mode démo, les données sont simulées. En mode réel, les données proviennent de l'API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiCacheDiagnostics;
