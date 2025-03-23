
import React from 'react';
import { useNotionAPI } from '@/hooks/useNotionAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Exemple de type pour les projets
interface Project {
  id: string;
  name: string;
  status: string;
}

/**
 * Exemple de composant utilisant le nouveau hook useNotionAPI
 * pour remplacer les anciens appels à mockMode
 */
const NotionAPIExample: React.FC = () => {
  const { executeOperation, isLoading, error, isDemoMode } = useNotionAPI();
  const [projects, setProjects] = React.useState<Project[]>([]);
  
  // Exemple de chargement de projets
  const loadProjects = async () => {
    try {
      // Utilisation du hook avec gestion automatique du mode démo
      const data = await executeOperation<Project[]>(
        // Fonction à exécuter en mode réel
        () => fetch('/api/projects').then(res => res.json()),
        {
          // Données à utiliser en mode démo
          demoData: [
            { id: 'demo1', name: 'Projet Démo 1', status: 'En cours' },
            { id: 'demo2', name: 'Projet Démo 2', status: 'Complété' }
          ],
          // Options de configuration
          showLoadingToast: true,
          messages: {
            loading: 'Chargement des projets...',
            success: 'Projets chargés',
            error: 'Erreur lors du chargement des projets'
          }
        }
      );
      
      setProjects(data);
    } catch (err) {
      // executeOperation gère déjà les erreurs, mais on peut ajouter une logique supplémentaire ici
      console.error('Erreur traitée :', err);
    }
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Projets ({projects.length})</span>
          {isDemoMode && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Mode Démo
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={loadProjects}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger les projets'
            )}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error.message}
            </div>
          )}
          
          <div className="border rounded-md divide-y">
            {projects.map(project => (
              <div key={project.id} className="p-3">
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-500">{project.status}</div>
              </div>
            ))}
            
            {projects.length === 0 && !isLoading && (
              <div className="p-3 text-center text-gray-500 text-sm">
                Aucun projet à afficher
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionAPIExample;
