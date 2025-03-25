
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

// Fonction de remplacement pour handleCallback si elle n'existe pas
const defaultHandleCallback = async (code: string, state: string): Promise<boolean> => {
  console.warn('handleCallback non disponible dans useNotionOAuth');
  return false;
};

/**
 * Page de callback pour l'authentification OAuth Notion
 */
const NotionOAuthCallback: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtenir le hook OAuth et gérer le cas où handleCallback n'existe pas
  const oauthHook = useNotionOAuth({
    onAuthError: (error) => setError(error.message)
  });
  
  // Fournir un fallback pour handleCallback si nécessaire
  const handleCallback = oauthHook.handleCallback || defaultHandleCallback;
  
  // Traiter les paramètres d'URL au chargement
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');
        
        if (errorParam) {
          setError(`Erreur d'authentification: ${errorParam}`);
          setIsProcessing(false);
          return;
        }
        
        if (!code || !state) {
          setError('Paramètres manquants dans l\'URL de callback');
          setIsProcessing(false);
          return;
        }
        
        // Traiter le callback OAuth
        const callbackSuccess = await handleCallback(code, state);
        setSuccess(callbackSuccess);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsProcessing(false);
      }
    };
    
    processOAuthCallback();
  }, [location.search, handleCallback]);
  
  // Rediriger vers la page d'accueil après un délai en cas de succès
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            {isProcessing ? (
              <>
                <RefreshCw className="h-12 w-12 mx-auto text-tmw-teal animate-spin" />
                <h2 className="mt-4 text-xl font-semibold">Traitement de l'authentification...</h2>
                <p className="mt-2 text-gray-500">
                  Veuillez patienter pendant que nous finalisons l'authentification avec Notion.
                </p>
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="mt-4 text-xl font-semibold text-green-700">Authentification réussie!</h2>
                <p className="mt-2 text-gray-500">
                  Vous êtes maintenant connecté à Notion. Redirection en cours...
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="mt-4 text-xl font-semibold text-red-700">Échec de l'authentification</h2>
                <p className="mt-2 text-gray-500">
                  {error || "Une erreur s'est produite lors de l'authentification avec Notion."}
                </p>
                <div className="mt-6">
                  <Button onClick={() => navigate('/')}>
                    Retour à l'accueil
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotionOAuthCallback;
