
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, XCircle, Loader2, Info, RefreshCw, Save, Lock, Eye, Database } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import NotionSolutionsSection from './NotionSolutionsSection';

interface NotionCreatePageTestProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const NotionCreatePageTest: React.FC<NotionCreatePageTestProps> = ({ onSuccess, onError }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    code?: string;
    details?: string;
  } | null>(null);
  const [createdPageInfo, setCreatedPageInfo] = useState<{
    id: string;
    title: string;
    url?: string;
  } | null>(null);

  const runCreateTest = async () => {
    setIsRunning(true);
    setStatus('running');
    setErrorDetails(null);
    setCreatedPageInfo(null);

    // Get required values from localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');

    if (!apiKey || !dbId) {
      setStatus('error');
      setErrorDetails({
        message: 'Configuration Notion manquante',
        details: 'L\'API key ou l\'ID de base de données n\'est pas configuré.'
      });
      setIsRunning(false);
      return;
    }

    console.log('📝 Début du test de création de page Notion');
    
    // Force real mode for this test
    const wasMockMode = notionApi.mockMode.isActive();
    if (wasMockMode) {
      console.log('🔄 Désactivation temporaire du mode mock pour le test');
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      notionApi.mockMode.forceReset();
    }

    try {
      // First verify authentication
      try {
        console.log('🔑 Vérification de l\'authentification...');
        const user = await notionApi.users.me(apiKey);
        console.log('✅ Authentification OK:', user.name || user.id);
      } catch (authError) {
        console.error('❌ Erreur d\'authentification:', authError);
        throw new Error(`Échec d'authentification: ${authError.message}`);
      }

      // Then verify database access (read)
      try {
        console.log('🔍 Vérification de l\'accès à la base de données...');
        const dbInfo = await notionApi.databases.retrieve(dbId, apiKey);
        console.log('✅ Accès à la base OK:', dbInfo.title?.[0]?.plain_text || dbInfo.id);
      } catch (dbError) {
        console.error('❌ Erreur d\'accès à la base de données:', dbError);
        throw new Error(`Échec d'accès à la base de données: ${dbError.message}`);
      }

      // Create a test page
      console.log('📝 Tentative de création d\'une page...');

      const timestamp = new Date().toISOString();
      const testTitle = `Test de création ${timestamp}`;

      // Build properties object based on database schema
      console.log('🏗️ Préparation des données pour création...');
      const createData = {
        parent: { database_id: dbId },
        properties: {
          Name: {
            title: [{ text: { content: testTitle } }]
          },
          // Add fallback properties with different casings
          // The API will only use properties that match the database schema
          Status: { select: { name: "Test" } },
          status: { select: { name: "Test" } },
          Description: { rich_text: [{ text: { content: "Test de permissioncréation via l'outil de diagnostic" } }] },
          description: { rich_text: [{ text: { content: "Test de création via l'outil de diagnostic" } }] },
          URL: { url: "https://tests.example.com/permission-check" },
          url: { url: "https://tests.example.com/permission-check" },
          Url: { url: "https://tests.example.com/permission-check" }
        }
      };

      console.log('📤 Envoi des données:', JSON.stringify(createData, null, 2));

      const createdPage = await notionApi.pages.create(createData, apiKey);

      if (createdPage && createdPage.id) {
        console.log('✅ Page créée avec succès!', createdPage.id);
        
        setCreatedPageInfo({
          id: createdPage.id,
          title: testTitle,
          url: `https://notion.so/${createdPage.id.replace(/-/g, '')}`
        });
        
        setStatus('success');
        
        if (onSuccess) {
          onSuccess();
        }
        
        toast.success('Page créée avec succès!', {
          description: 'L\'intégration a les permissions d\'écriture correctes.'
        });
      } else {
        throw new Error('Réponse invalide de l\'API Notion lors de la création');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la page:', error);
      
      setStatus('error');
      
      // Parse the error message for more details
      let errorMsg = error.message || 'Erreur inconnue';
      let errorCode = '';
      let errorDetail = '';
      
      // Check for 403 Forbidden (permissions issue)
      if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
        errorCode = '403 Forbidden';
        errorDetail = 'L\'intégration n\'a pas les permissions d\'écriture nécessaires sur cette base de données. Vérifiez que l\'intégration est partagée avec la base et a les permissions d\'écriture.';
        
        toast.error('Erreur de permission', {
          description: 'L\'intégration n\'a pas les permissions d\'écriture sur cette base de données Notion.',
          duration: 8000
        });
      }
      // Check for 401 Unauthorized (authentication issue)
      else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        errorCode = '401 Unauthorized';
        errorDetail = 'L\'authentification a échoué. Vérifiez que votre clé d\'API est valide et n\'a pas expiré.';
      }
      // Check for validation issues
      else if (errorMsg.includes('validation_error') || errorMsg.includes('required')) {
        errorCode = 'Validation Error';
        errorDetail = 'La structure des données ne correspond pas au schéma de la base de données. Vérifiez les propriétés requises.';
      }
      
      setErrorDetails({
        message: errorMsg,
        code: errorCode,
        details: errorDetail
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsRunning(false);
      // Restore mock mode if it was active
      if (wasMockMode) {
        console.log('🔄 Restauration du mode mock après le test');
        notionApi.mockMode.activate();
      }
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Succès</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échec</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">En attente</Badge>;
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-amber-200 shadow-sm">
      <CardHeader className="bg-amber-50/50 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-amber-500" />
            <CardTitle className="text-lg text-amber-800">Test de création Notion</CardTitle>
          </div>
          {renderStatusBadge()}
        </div>
        <CardDescription className="text-amber-700">
          Vérifie les permissions d'écriture en créant une page test dans votre base de données Notion
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {status === 'error' && errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">
                  {errorDetails.code ? `${errorDetails.code}` : 'Erreur'}
                </h3>
                <p className="text-red-700 mt-1">{errorDetails.message}</p>
                {errorDetails.details && (
                  <p className="text-red-600 mt-2 text-xs">{errorDetails.details}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {status === 'success' && createdPageInfo && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800">Page créée avec succès</h3>
                <p className="text-green-700 mt-1">
                  Une page test a été créée dans votre base de données Notion.
                </p>
                <p className="text-green-600 mt-2 text-xs">
                  ID: {createdPageInfo.id}
                </p>
                {createdPageInfo.url && (
                  <a 
                    href={createdPageInfo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-xs inline-flex items-center text-green-700 hover:text-green-800 hover:underline"
                  >
                    <Eye size={12} className="mr-1" />
                    Voir la page dans Notion
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        
        {status === 'error' && errorDetails?.code === '403 Forbidden' && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1.5">
              <Lock size={14} className="text-amber-500" />
              Problème de permissions
            </h3>
            <div className="text-sm text-amber-700 mb-4">
              <p className="mb-2">
                Pour résoudre ce problème de permissions, assurez-vous que :
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Votre intégration Notion est partagée avec la base de données</li>
                <li>L'intégration a les permissions d'écriture (et pas seulement de lecture)</li>
                <li>Vous utilisez la bonne clé d'API pour cette intégration</li>
              </ol>
            </div>
            
            <NotionSolutionsSection 
              showCorsProxy={false}
              showMockMode={false}
              showApiKey={true}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-amber-50/50 border-t border-amber-100 px-4 py-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            notionApi.mockMode.forceReset();
            localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
            localStorage.removeItem('notion_last_error');
            setStatus('idle');
            setErrorDetails(null);
            setCreatedPageInfo(null);
            toast.success('État réinitialisé', {
              description: 'Les erreurs ont été effacées et le mode réel est activé.'
            });
          }}
          className="text-amber-700 border-amber-300 hover:bg-amber-100"
        >
          <RefreshCw size={14} className="mr-1.5" />
          Réinitialiser
        </Button>
        
        <Button
          onClick={runCreateTest}
          disabled={isRunning}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="mr-1.5 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Database size={14} className="mr-1.5" />
              Tester les permissions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionCreatePageTest;
