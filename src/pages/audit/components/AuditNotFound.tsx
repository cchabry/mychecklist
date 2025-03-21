
import React from 'react';
import { NavigateFunction, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Plus, Info, RefreshCw, ArrowLeft } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';

interface AuditNotFoundProps {
  navigate: NavigateFunction;
  projectId?: string;
  error?: string;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ navigate, projectId, error }) => {
  // Fonction pour nettoyer l'ID du projet
  const getCleanProjectId = () => {
    if (!projectId) return undefined;
    
    console.log(`AuditNotFound - Tentative de nettoyage de l'ID: "${projectId}"`);
    
    // Si l'ID est une chaîne simple, la retourner directement
    if (typeof projectId === 'string' && !projectId.startsWith('"')) {
      console.log(`AuditNotFound - ID déjà propre: "${projectId}"`);
      return projectId;
    }
    
    // Si l'ID est une chaîne JSON, essayons de l'extraire
    try {
      if (projectId.startsWith('"') && projectId.endsWith('"')) {
        const cleanedId = JSON.parse(projectId);
        console.log(`AuditNotFound - ID nettoyé de JSON: "${projectId}" => "${cleanedId}"`);
        return cleanedId;
      }
    } catch (e) {
      console.error(`AuditNotFound - Erreur lors du nettoyage de l'ID: "${projectId}"`, e);
    }
    
    // Si on arrive ici, retourner l'ID tel quel
    return projectId;
  };
  
  const cleanProjectId = getCleanProjectId();
  
  // Fonction pour réinitialiser le mode mock et recharger
  const handleForceReset = () => {
    notionApi.mockMode.forceReset();
    localStorage.removeItem('notion_mock_mode');
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    // Redirige vers l'accueil
    setTimeout(() => {
      navigate('/');
    }, 500);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-6 bg-white rounded-lg shadow-md border border-gray-100">
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
              <p>
                <span className="font-medium">Mode mock:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {notionApi.mockMode.isActive() ? 'Actif' : 'Inactif'}
                </code>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
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
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs text-gray-500 mb-3">
              Si le problème persiste, essayez de réinitialiser les caches et le mode mock :
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceReset}
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              <RefreshCw size={14} className="mr-2" />
              Réinitialiser et recharger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditNotFound;
