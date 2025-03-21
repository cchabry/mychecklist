
import React from 'react';
import { NavigateFunction, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Plus, Info } from 'lucide-react';

interface AuditNotFoundProps {
  navigate: NavigateFunction;
  projectId?: string;
  error?: string;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ navigate, projectId, error }) => {
  // Fonction pour nettoyer l'ID du projet si nécessaire
  const getCleanProjectId = () => {
    if (!projectId) return undefined;
    
    // Si l'ID est une chaîne JSON, essayons de l'extraire
    try {
      if (projectId.startsWith('"') && projectId.endsWith('"')) {
        return JSON.parse(projectId);
      }
    } catch (e) {
      console.error("Erreur lors du nettoyage de l'ID:", e);
    }
    
    return projectId;
  };
  
  const cleanProjectId = getCleanProjectId();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Projet non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Le projet que vous cherchez n'existe pas ou a été supprimé.
          </p>
          
          {/* Informations détaillées sur l'erreur */}
          <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200 text-left">
            <h3 className="font-medium flex items-center gap-1 text-gray-700 mb-2">
              <Info size={16} className="text-blue-500" />
              Détails techniques
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-medium">ID recherché:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {projectId ? `"${projectId}"` : 'aucun ID fourni'}
                </code>
              </p>
              {cleanProjectId !== projectId && (
                <p>
                  <span className="font-medium">ID nettoyé:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {cleanProjectId ? `"${cleanProjectId}"` : 'échec du nettoyage'}
                  </code>
                </p>
              )}
              {error && (
                <p>
                  <span className="font-medium">Erreur:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{error}</code>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            {cleanProjectId && (
              <Button 
                variant="default"
                onClick={() => navigate(`/audit/new/${cleanProjectId}`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un audit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditNotFound;
