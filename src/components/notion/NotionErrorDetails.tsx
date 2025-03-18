
import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AlertCircle, FileCode, ExternalLink, Server, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotionErrorStatusSection from './NotionErrorStatusSection';
import NotionProxyConfigSection from './NotionProxyConfigSection';
import NotionFetchErrorSection from './NotionFetchErrorSection';
import NotionSolutionsSection from './NotionSolutionsSection';
import NotionAlternativesSection from './NotionAlternativesSection';
import NotionErrorActions from './NotionErrorActions';
import NotionDeploymentChecker from './NotionDeploymentChecker';
import { VERCEL_PROXY_URL } from '@/lib/notionProxy/config';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState<string>('diagnostic');
  const [networkTest, setNetworkTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    code?: number;
  }>({
    status: 'idle',
    message: 'Cliquez sur "Tester la connexion" pour diagnostiquer le problème'
  });
  
  const copyErrorDetails = () => {
    const details = `
Erreur Notion: ${error}
Contexte: ${context || 'Non spécifié'}
Navigateur: ${navigator.userAgent}
URL: ${window.location.href}
Proxy URL: ${VERCEL_PROXY_URL}
Date: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
    toast.success('Détails copiés dans le presse-papier');
  };
  
  const runNetworkTest = async () => {
    setNetworkTest({
      status: 'testing',
      message: 'Test de connexion en cours...'
    });
    
    try {
      // Test 1: Vérifier si le serveur répond (ping)
      try {
        const pingResponse = await fetch(`${window.location.origin}/api/ping`, {
          method: 'GET',
          cache: 'no-store'
        });
        
        if (!pingResponse.ok) {
          setNetworkTest({
            status: 'error',
            message: `Le serveur ne répond pas correctement au ping (${pingResponse.status})`,
            code: pingResponse.status
          });
          return;
        }
        
        // Test 2: Vérifier si le proxy existe (HEAD)
        const proxyHeadResponse = await fetch(`${window.location.origin}/api/notion-proxy`, {
          method: 'HEAD',
          cache: 'no-store'
        });
        
        // Test 3: Essayer une vraie requête au proxy
        const testProxyResponse = await fetch(`${window.location.origin}/api/notion-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            endpoint: '/ping',
            method: 'GET',
            token: 'test_token_for_diagnostics'
          })
        });
        
        if (testProxyResponse.status === 404) {
          setNetworkTest({
            status: 'error',
            message: 'Le fichier api/notion-proxy.ts est déployé mais ne répond pas aux requêtes POST',
            code: 404
          });
        } else if (!testProxyResponse.ok) {
          setNetworkTest({
            status: 'error',
            message: `Le proxy répond avec une erreur: ${testProxyResponse.status}`,
            code: testProxyResponse.status
          });
        } else {
          // Tout va bien!
          setNetworkTest({
            status: 'success',
            message: 'Le proxy Notion répond correctement aux requêtes. Si vous avez des erreurs, vérifiez votre clé API.'
          });
        }
      } catch (error) {
        setNetworkTest({
          status: 'error',
          message: `Erreur lors du test de connexion: ${error.message}`
        });
      }
    } catch (mainError) {
      setNetworkTest({
        status: 'error',
        message: `Erreur critique: ${mainError.message}`
      });
    }
  };
  
  // Analyser le type d'erreur de façon plus précise
  const isFailedToFetch = error.includes('Failed to fetch');
  const isEndpointNotFound = error.includes('404') || 
                            error.includes('introuvable') || 
                            error.includes('Endpoint du proxy introuvable');
  const isProxyMessage = error.includes('Tentative de connexion via proxy') || 
                         isEndpointNotFound || 
                         error.includes('proxy');
  
  // Déterminer s'il s'agit d'une erreur 404 spécifique au proxy
  const isProxy404Error = isEndpointNotFound;
  
  // Déterminer si l'erreur est liée au déploiement Vercel
  const isVercelDeploymentIssue = isProxy404Error || 
                                 error.includes('Vercel') || 
                                 error.includes('déploiement');
  
  // Déterminer le titre et la description en fonction de l'erreur
  let title = 'Limitation technique Notion';
  let description = 'Explication du problème et des solutions possibles';
  
  if (isProxy404Error) {
    title = 'Fichier API manquant';
    description = 'Le fichier api/notion-proxy.ts est introuvable ou ne répond pas correctement';
  } else if (isProxyMessage) {
    title = 'Configuration du proxy Notion';
    description = 'Instructions pour finaliser la configuration du proxy';
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl max-h-screen overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center text-amber-600 gap-2 mb-2">
            {isProxy404Error ? (
              <FileCode size={20} />
            ) : isProxyMessage ? (
              <ExternalLink size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <SheetTitle className="text-amber-600">
              {title}
            </SheetTitle>
          </div>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="test">Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="diagnostic" className="space-y-4 mt-4">
              <NotionErrorStatusSection error={error} context={context} />
              
              {isVercelDeploymentIssue && (
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Server size={16} className="text-amber-600" />
                    Problème de déploiement détecté
                  </h3>
                  <p className="text-sm text-amber-800 mb-4">
                    Le fichier <code className="bg-white/70 px-1 py-0.5 rounded">api/notion-proxy.ts</code> semble 
                    manquant ou inaccessible sur votre déploiement Vercel. Ce fichier est essentiel pour 
                    contourner les limitations CORS de l'API Notion.
                  </p>
                  
                  <NotionDeploymentChecker />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="solution" className="space-y-4 mt-4">
              {(isProxyMessage || isProxy404Error) ? (
                <NotionProxyConfigSection />
              ) : isFailedToFetch ? (
                <NotionFetchErrorSection />
              ) : (
                <NotionSolutionsSection />
              )}
              
              {isFailedToFetch && !isProxyMessage && (
                <NotionAlternativesSection />
              )}
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4 mt-4">
              <div className="bg-slate-50 border rounded-md p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Terminal size={16} />
                  Diagnostic de connexion
                </h3>
                
                <div className={`p-3 rounded-md mb-4 ${
                  networkTest.status === 'error' 
                    ? 'bg-red-50 border border-red-200 text-red-800' 
                    : networkTest.status === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-gray-50 border text-gray-600'
                }`}>
                  <p className="text-sm">
                    {networkTest.message}
                  </p>
                  {networkTest.code && (
                    <p className="text-xs mt-1">Code: {networkTest.code}</p>
                  )}
                </div>
                
                <Button 
                  onClick={runNetworkTest}
                  disabled={networkTest.status === 'testing'}
                  className="w-full"
                >
                  {networkTest.status === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
                </Button>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Ce test vérifie si le proxy Notion est correctement configuré et accessible.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <NotionErrorActions 
            onCopyDetails={copyErrorDetails} 
            isProxyMessage={isProxyMessage || isProxy404Error} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionErrorDetails;
