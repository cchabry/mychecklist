
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
  const isProxyMessage = error.includes('Tentative de connexion via proxy');
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center text-amber-600 gap-2 mb-2">
            <AlertCircle size={20} />
            <SheetTitle className="text-amber-600">
              {isProxyMessage ? 'Configuration du proxy Notion' : 'Limitation technique Notion'}
            </SheetTitle>
          </div>
          <SheetDescription>
            {isProxyMessage 
              ? 'Instructions pour finaliser la configuration du proxy' 
              : 'Explication du problème et des solutions possibles'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h3 className="font-medium mb-2 text-amber-700">Statut actuel</h3>
            <p className="text-sm text-amber-600">{error}</p>
            {context && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <p className="text-xs text-amber-500">Contexte: {context}</p>
              </div>
            )}
          </div>
          
          {isProxyMessage ? (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
                <Server size={16} />
                Configuration du proxy Vercel
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Pour finaliser la configuration et pouvoir utiliser l'API Notion directement:
              </p>
              <ol className="space-y-3 list-decimal pl-5">
                <li className="text-sm">
                  Suivez les instructions du fichier README.md pour déployer le projet sur Vercel
                </li>
                <li className="text-sm">
                  Une fois déployé, mettez à jour l'URL du proxy dans le fichier notionProxy.ts
                </li>
                <li className="text-sm">
                  Redéployez le projet et configurez à nouveau votre connexion Notion
                </li>
              </ol>
              <p className="text-sm mt-3 text-blue-700">
                En attendant, l'application fonctionnera en mode démonstration avec des données de test.
              </p>
            </div>
          ) : isFailedToFetch ? (
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
                  <span className="text-sm">La solution idéale nécessite un serveur intermédiaire (proxy) qui fait les appels à l'API Notion</span>
                </div>
                <div className="flex gap-2 items-start">
                  <Zap size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pour cette application, nous utilisons Vercel Functions comme proxy</span>
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
          
          {isFailedToFetch && !isProxyMessage && (
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle size={16} />
                Solutions alternatives
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Temporaire</strong> : Utiliser le mode démonstration avec des données de test</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>En cours</strong> : Utiliser le proxy Vercel (voir README.md pour la configuration)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Alternative</strong> : Utiliser une autre solution de base de données comme Supabase</span>
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
            {isProxyMessage ? (
              <Button 
                className="flex gap-2 bg-tmw-teal hover:bg-tmw-teal/90"
                asChild
              >
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <Server size={16} />
                  Accéder à Vercel
                </a>
              </Button>
            ) : (
              <Button 
                className="flex gap-2 bg-tmw-teal hover:bg-tmw-teal/90"
                asChild
              >
                <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Gérer les intégrations Notion
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionErrorDetails;
