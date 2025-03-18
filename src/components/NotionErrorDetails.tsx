
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Copy, ExternalLink, Globe, Shield, Zap, Server } from 'lucide-react';

interface NotionErrorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  context?: string;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({
  isOpen,
  onClose,
  error,
  context
}) => {
  const copyErrorDetails = () => {
    const details = `
Erreur Notion: ${error}
Contexte: ${context || 'Non spécifié'}
Navigateur: ${navigator.userAgent}
Date: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };
  
  // Vérifier si c'est une erreur "Failed to fetch"
  const isFailedToFetch = error.includes('Failed to fetch');
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center text-amber-600 gap-2 mb-2">
            <AlertCircle size={20} />
            <SheetTitle className="text-amber-600">Limitation technique Notion</SheetTitle>
          </div>
          <SheetDescription>
            Explication du problème et des solutions possibles
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h3 className="font-medium mb-2 text-amber-700">Problème détecté</h3>
            <p className="text-sm text-amber-600">{error}</p>
            {context && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <p className="text-xs text-amber-500">Contexte: {context}</p>
              </div>
            )}
          </div>
          
          {isFailedToFetch ? (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
                <Shield size={16} />
                Pourquoi ce problème se produit
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                L'erreur "Failed to fetch" est causée par des restrictions de sécurité du navigateur (CORS) qui empêchent l'accès direct à l'API Notion. <strong>Ce n'est pas lié au type d'intégration Notion (interne ou public).</strong>
              </p>
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <Globe size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Les applications frontend ne peuvent pas accéder directement à l'API Notion depuis le navigateur</span>
                </div>
                <div className="flex gap-2 items-start">
                  <Server size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">La solution idéale nécessiterait un serveur intermédiaire qui ferait les appels à l'API Notion</span>
                </div>
                <div className="flex gap-2 items-start">
                  <Zap size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pour cette démonstration, l'application utilise des données de test locales</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-3">Solutions possibles</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Vérifiez que votre clé API commence par "secret_" et est correctement copiée</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Assurez-vous que l'intégration a accès à la base de données (partagez la base avec l'intégration)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Vérifiez l'ID de base de données dans l'URL Notion</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Vérifiez votre connexion internet</span>
                </li>
              </ul>
            </div>
          )}
          
          {isFailedToFetch && (
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle size={16} />
                Solutions alternatives
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Actuel</strong> : Utiliser le mode démonstration avec des données de test</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Optimal</strong> : Implémenter un backend qui servirait de proxy pour les appels à l'API Notion</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Autre</strong> : Utiliser des solutions serverless comme Netlify Functions ou Vercel Edge Functions</span>
                </li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex gap-2"
              onClick={copyErrorDetails}
            >
              <Copy size={16} />
              Copier les détails
            </Button>
            <Button 
              className="flex gap-2 bg-tmw-teal hover:bg-tmw-teal/90"
              asChild
            >
              <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                Gérer les intégrations Notion
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionErrorDetails;
