
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw, ArrowLeft, Info } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { resetApplicationState } from '@/lib/utils';
import { toast } from 'sonner';

// Fonction pour parser les paramètres de query
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ErrorPage = () => {
  const { errorType } = useParams<{ errorType: string }>();
  const query = useQuery();
  const navigate = useNavigate();
  const [isMockMode, setIsMockMode] = useState(false);
  
  // Lire les paramètres d'URL
  const id = query.get('id');
  const error = query.get('error');
  
  useEffect(() => {
    // Vérifier le mode mock
    setIsMockMode(notionApi.mockMode.isActive());
    
    // Journaliser les informations d'erreur pour le débogage
    console.log('ErrorPage - Détails:', {
      errorType,
      id,
      error,
      mockMode: notionApi.mockMode.isActive()
    });
  }, [errorType, id, error]);
  
  // Fonction pour réinitialiser l'application et retourner à l'accueil
  const handleReset = () => {
    resetApplicationState();
    toast.success('Application réinitialisée', {
      description: 'Toutes les caches et paramètres ont été effacés.'
    });
    
    setTimeout(() => {
      navigate('/');
    }, 500);
  };
  
  // Configurer le titre et le message selon le type d'erreur
  let title = 'Erreur';
  let message = 'Une erreur est survenue.';
  
  switch (errorType) {
    case 'project-not-found':
      title = 'Projet non trouvé';
      message = 'Le projet que vous cherchez n\'existe pas ou a été supprimé.';
      break;
      
    case 'audit-not-found':
      title = 'Audit non trouvé';
      message = 'L\'audit que vous cherchez n\'existe pas ou a été supprimé.';
      break;
      
    case 'notion-error':
      title = 'Erreur de connexion Notion';
      message = 'Une erreur est survenue lors de la communication avec Notion.';
      break;
      
    default:
      title = 'Erreur inconnue';
      message = 'Une erreur inconnue est survenue.';
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">
            {message}
          </p>
          
          {/* Informations détaillées sur l'erreur */}
          <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200 text-left">
            <h3 className="font-medium flex items-center gap-1 text-gray-700 mb-2">
              <Info size={16} className="text-blue-500" />
              Détails techniques
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              {id && (
                <p>
                  <span className="font-medium">ID recherché:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {id}
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
                  {isMockMode ? 'Actif' : 'Inactif'}
                </code>
              </p>
              <p>
                <span className="font-medium">Type d'erreur:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  {errorType}
                </code>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs text-gray-500 mb-3">
              Si le problème persiste, essayez de réinitialiser les caches et le mode mock :
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
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

export default ErrorPage;
