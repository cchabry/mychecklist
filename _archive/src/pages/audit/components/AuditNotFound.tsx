
import React, { useEffect, useState } from 'react';
import { NavigateFunction, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Plus, Info, RefreshCw, ArrowLeft } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { cleanProjectId } from '@/lib/utils';

interface AuditNotFoundProps {
  navigate: NavigateFunction;
  projectId?: string;
  error?: string;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ navigate, projectId, error }) => {
  // État pour suivre la tentative de rechargement
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Obtenir l'ID propre du projet
  const cleanedProjectId = projectId ? cleanProjectId(projectId) : '';
  console.log(`🔍 AuditNotFound - projectId original: "${projectId}", nettoyé: "${cleanedProjectId}"`);
  
  // Essayer une vérification explicite du projet au montage
  useEffect(() => {
    const verifyProjectExistence = async () => {
      if (!cleanedProjectId) return;
      
      try {
        console.log(`🔍 AuditNotFound - Vérification explicite de l'existence du projet: "${cleanedProjectId}"`);
        
        // Force le mode mock à être désactivé pour tester l'accès réel
        const wasMockActive = notionApi.mockMode.isActive();
        if (wasMockActive) {
          console.log('🔄 AuditNotFound - Désactivation temporaire du mode mock pour vérification');
          notionApi.mockMode.forceReset();
        }
        
        // Forcer une réinitialisation du cache pour cette vérification
        localStorage.removeItem('projects_cache');
        
        // Vérifier si le projet existe réellement
        const project = await notionApi.getProject(cleanedProjectId);
        
        if (project) {
          console.log(`✅ AuditNotFound - Projet vérifié et trouvé: "${project.name}"`);
          
          // Si le projet existe mais qu'on est dans AuditNotFound, c'est un problème de cache ou d'état
          // Naviguer vers la page d'audit avec le projet
          setTimeout(() => {
            navigate(`/audit/new/${cleanedProjectId}`);
          }, 1000);
        } else {
          console.log(`❌ AuditNotFound - Projet vérifié mais non trouvé: "${cleanedProjectId}"`);
          
          // Restaurer le mode mock si nécessaire
          if (wasMockActive) {
            notionApi.mockMode.activate();
          }
        }
      } catch (e) {
        console.error('Erreur lors de la vérification du projet:', e);
      }
    };
    
    // Si c'est une tentative de refraîchissement, vérifier le projet
    if (isRetrying && retryCount === 1) {
      verifyProjectExistence();
    }
  }, [cleanedProjectId, navigate, isRetrying, retryCount]);
  
  // Fonction pour réinitialiser le mode mock et recharger
  const handleForceReset = () => {
    console.log('🔄 AuditNotFound - Réinitialisation complète demandée');
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Supprimer toutes les données de cache
    localStorage.removeItem('notion_mock_mode');
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    localStorage.removeItem('notion_last_error');
    localStorage.removeItem('notion_request_log');
    
    // Désactiver forcément le mode mock
    notionApi.mockMode.forceReset();
    
    // Redirige vers l'accueil après un court délai
    setTimeout(() => {
      console.log('🔄 AuditNotFound - Redirection vers la page courante après réinitialisation');
      // Recharger la page actuelle
      window.location.reload();
    }, 1000);
  };
  
  // Récupérer des données de diagnostic supplémentaires
  const mockModeActive = notionApi.mockMode.isActive();
  const notionApiKey = localStorage.getItem('notion_api_key') ? "Configurée" : "Non configurée";
  const notionDbId = localStorage.getItem('notion_database_id') ? "Configurée" : "Non configurée";
  const cacheProjects = localStorage.getItem('projects_cache') ? "Présent" : "Absent";
  
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
              {cleanedProjectId !== projectId && (
                <p>
                  <span className="font-medium">ID nettoyé:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {cleanedProjectId ? `"${cleanedProjectId}"` : 'échec du nettoyage'}
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
                  {mockModeActive ? 'Actif' : 'Inactif'}
                </code>
              </p>
              <p>
                <span className="font-medium">Clé API Notion:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">{notionApiKey}</code>
              </p>
              <p>
                <span className="font-medium">Base de données Notion:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">{notionDbId}</code>
              </p>
              <p>
                <span className="font-medium">Cache des projets:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">{cacheProjects}</code>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            {cleanedProjectId && (
              <Button 
                variant="default"
                onClick={() => navigate(`/audit/new/${cleanedProjectId}`)}
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
              disabled={isRetrying}
            >
              {isRetrying ? (
                <RefreshCw size={14} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={14} className="mr-2" />
              )}
              {isRetrying ? 'Réinitialisation...' : 'Réinitialiser et recharger'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditNotFound;
