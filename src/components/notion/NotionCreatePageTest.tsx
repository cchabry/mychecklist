
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCw, CheckCircle, XCircle, Database } from 'lucide-react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

const NotionCreatePageTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    pageId?: string;
    error?: string;
  } | null>(null);

  const runCreateTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      // Récupérer les clés Notion
      const apiKey = localStorage.getItem('notion_api_key');
      const dbId = localStorage.getItem('notion_database_id');
      
      if (!apiKey || !dbId) {
        toast.error('Configuration Notion manquante', {
          description: 'Veuillez configurer votre clé API et votre base de données Notion'
        });
        setTestResult({
          success: false,
          message: 'Configuration Notion manquante',
          error: 'Clé API ou ID de base de données non défini'
        });
        setIsRunning(false);
        return;
      }
      
      // Forcer le mode réel pendant le test
      const wasMockMode = notionApi.mockMode.isActive();
      console.log('💡 Test de création: Mode mock actif?', wasMockMode);
      
      // Nettoyage agressif
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      localStorage.removeItem('notion_last_error');
      localStorage.setItem('notion_force_real', 'true');
      
      // S'assurer que le mock mode est désactivé
      notionApi.mockMode.forceReset();
      
      if (notionApi.mockMode.isActive()) {
        console.warn('⚠️ ATTENTION: Le mode mock est encore actif malgré la tentative de désactivation!');
        toast.warning('Mode mock toujours actif', {
          description: 'Impossible de désactiver complètement le mode mock'
        });
      } else {
        console.log('✅ Mode réel activé pour le test de création');
      }
      
      // Créer un objet de test avec un timestamp pour garantir l'unicité
      const timestamp = new Date().toISOString();
      const testTitle = `Test de création directe ${timestamp}`;
      
      // Préparer les données pour la création
      const createData = {
        parent: { database_id: dbId },
        properties: {
          Name: {
            title: [{ text: { content: testTitle } }]
          },
          Status: {
            select: { name: "Test" }
          },
          Description: {
            rich_text: [{ text: { content: "Test de création directe depuis la page d'accueil" } }]
          },
          URL: {
            url: "https://test.example.com/direct-test"
          }
        }
      };
      
      console.log('📝 Tentative de création directe:', JSON.stringify(createData, null, 2));
      
      // Tentative de création via le proxy
      const response = await notionApi.pages.create(createData, apiKey);
      
      if (response && response.id) {
        console.log('✅ Création de page réussie:', response.id);
        setTestResult({
          success: true,
          message: 'Page créée avec succès',
          pageId: response.id
        });
        
        toast.success('Page créée avec succès', {
          description: `ID: ${response.id}`
        });
      } else {
        throw new Error('Pas d\'ID retourné par l\'API');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test de création:', error);
      setTestResult({
        success: false,
        message: 'Échec de la création',
        error: error.message || 'Erreur inconnue'
      });
      
      toast.error('Échec de création', {
        description: error.message || 'Erreur inconnue'
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Test de création dans Notion</CardTitle>
        <CardDescription>
          Teste la capacité à créer une page dans votre base de données Notion
        </CardDescription>
      </CardHeader>
      <CardContent>
        {testResult && (
          <div className={`p-3 rounded-md mb-4 ${
            testResult.success 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{testResult.message}</p>
                {testResult.pageId && (
                  <p className="text-sm mt-1">ID de la page: {testResult.pageId}</p>
                )}
                {testResult.error && (
                  <p className="text-sm mt-1 text-red-600">{testResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mb-4">
          Ce test va créer une nouvelle entrée dans votre base de données Notion pour vérifier que l'écriture fonctionne correctement.
          La page créée sera conservée pour vérification.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={runCreateTest}
          disabled={isRunning}
          className="w-full gap-2"
        >
          {isRunning ? (
            <RotateCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          {isRunning ? 'Création en cours...' : 'Lancer le test de création'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionCreatePageTest;
