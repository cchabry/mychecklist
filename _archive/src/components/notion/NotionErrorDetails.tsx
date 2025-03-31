
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Server, Globe, Key } from 'lucide-react';
import { NotionSolutionsSection } from './index';

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
  context = 'Opération Notion'
}) => {
  if (!error) return null;
  
  // Détection du type d'erreur
  const isCorsError = error.includes('Failed to fetch') || error.includes('CORS');
  const isAuthError = error.includes('401') || error.includes('authentication') || error.includes('Unauthorized');
  const isNotFoundError = error.includes('404') || error.includes('not found');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Erreur Notion
          </DialogTitle>
          <DialogDescription>
            Une erreur s'est produite lors de l'interaction avec l'API Notion
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Contexte</h4>
              <p className="text-sm text-muted-foreground">{context}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Message d'erreur</h4>
              <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap overflow-auto max-h-40">
                {error}
              </div>
            </div>
            
            {isCorsError && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Problème CORS détecté</h4>
                <p className="text-sm text-amber-700">
                  Cette erreur est typique des restrictions CORS qui empêchent les requêtes directes à l'API Notion depuis le navigateur.
                  Pour résoudre ce problème, un proxy serverless est nécessaire.
                </p>
              </div>
            )}
            
            {isAuthError && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <h4 className="text-sm font-medium text-red-800 mb-1">Problème d'authentification</h4>
                <p className="text-sm text-red-700">
                  Votre clé API semble être invalide ou mal formatée. Assurez-vous d'utiliser une clé d'intégration 
                  valide commençant par "secret_" ou un token OAuth commençant par "ntn_".
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="diagnostic">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Analyse technique</h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium">Type d'erreur détecté:</h5>
                    <p className="text-sm">
                      {isCorsError ? '⚠️ Erreur CORS / réseau' : ''}
                      {isAuthError ? '🔑 Erreur d\'authentification' : ''}
                      {isNotFoundError ? '🔍 Ressource non trouvée' : ''}
                      {!isCorsError && !isAuthError && !isNotFoundError ? '❓ Erreur non catégorisée' : ''}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium">Origine probable:</h5>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {isCorsError && (
                        <>
                          <li>Les navigateurs bloquent les requêtes directes à l'API Notion (sécurité CORS)</li>
                          <li>Un proxy serverless est nécessaire pour contourner cette limitation</li>
                          <li>Vérifiez votre connexion Internet</li>
                        </>
                      )}
                      {isAuthError && (
                        <>
                          <li>Format de clé API incorrect ou clé invalide</li>
                          <li>Permissions insuffisantes pour l'intégration</li>
                          <li>Token expiré ou révoqué</li>
                        </>
                      )}
                      {isNotFoundError && (
                        <>
                          <li>L'ID de base de données est incorrect ou la base a été supprimée</li>
                          <li>L'intégration n'a pas accès à cette base de données</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Environnement de lancement</h4>
                <p className="text-sm text-muted-foreground">
                  En développement local, les requêtes directes à l'API Notion sont généralement bloquées.
                  L'application nécessite un proxy serverless (comme une fonction Vercel ou Netlify) en production.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="solutions">
            <NotionSolutionsSection 
              showApiKey={isAuthError} 
              showCorsProxy={isCorsError}
              showMockMode={true}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {isCorsError ? 
              "Recommandation: Activez le mode démo ou configurez un proxy CORS" : 
              "Si le problème persiste, essayez d'activer le mode démo"}
          </div>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionErrorDetails;
