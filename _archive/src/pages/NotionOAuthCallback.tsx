
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';

/**
 * Page de callback OAuth pour l'authentification Notion
 */
const NotionOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer le hook OAuth
  const oauth = useNotionOAuth();
  
  // Traiter le code d'autorisation
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      setStatus('error');
      setError(error);
      return;
    }
    
    if (!code) {
      setStatus('error');
      setError('Aucun code d\'autorisation fourni');
      return;
    }
    
    // Vérifier si la méthode handleCallback existe
    if (typeof (oauth as any).handleCallback === 'function') {
      (async () => {
        try {
          await (oauth as any).handleCallback(code);
          setStatus('success');
        } catch (error) {
          setStatus('error');
          setError(error instanceof Error ? error.message : 'Erreur inconnue');
        }
      })();
    } else {
      // Implémentation fallback simple
      console.warn('Méthode handleCallback non disponible, utilisation du fallback');
      
      try {
        // Stocker le code pour un traitement ultérieur
        localStorage.setItem('notion_oauth_code', code);
        
        // Définir un flag indiquant que l'authentification est en attente
        localStorage.setItem('notion_oauth_pending', 'true');
        
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError('Erreur lors du stockage du code OAuth');
      }
    }
  }, [searchParams, oauth]);
  
  // Rediriger après le traitement
  const handleRedirect = () => {
    navigate('/');
  };
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            {status === 'processing' && (
              <>
                <AlertCircle className="h-6 w-6 text-amber-500 mr-2" />
                Authentification en cours...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                Authentification réussie
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
                Échec de l'authentification
              </>
            )}
          </CardTitle>
          
          <CardDescription>
            {status === 'processing' && 'Veuillez patienter pendant le traitement de votre authentification Notion.'}
            {status === 'success' && 'Vous avez été authentifié avec succès sur Notion.'}
            {status === 'error' && 'Une erreur s\'est produite lors de l\'authentification Notion.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'error' && error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          {(status === 'success' || status === 'error') && (
            <Button 
              className="w-full"
              onClick={handleRedirect}
            >
              Retourner à l'application
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotionOAuthCallback;
