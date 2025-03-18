
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { Bug, CheckCircle, XCircle, Database } from 'lucide-react';

const NotionTestButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<{
    connection: 'idle' | 'loading' | 'success' | 'error';
    projectsTable: 'idle' | 'loading' | 'success' | 'error';
    checklistsTable: 'idle' | 'loading' | 'success' | 'error';
    error?: string;
    projectsCount?: number;
    checklistsCount?: number;
  }>({
    connection: 'idle',
    projectsTable: 'idle',
    checklistsTable: 'idle'
  });

  const runTest = async () => {
    // Réinitialiser les résultats
    setTestResults({
      connection: 'loading',
      projectsTable: 'idle',
      checklistsTable: 'idle'
    });

    try {
      // Récupérer les infos de configuration
      const apiKey = localStorage.getItem('notion_api_key');
      const dbId = localStorage.getItem('notion_database_id');

      if (!apiKey || !dbId) {
        setTestResults({
          connection: 'error',
          projectsTable: 'idle',
          checklistsTable: 'idle',
          error: 'Configuration Notion manquante. Veuillez configurer votre intégration Notion.'
        });
        return;
      }

      console.log('🧪 Test Notion - Vérification de la connexion avec la clé:', apiKey.substring(0, 8) + '...');

      // Test 1: Tester la connexion à l'API Notion
      try {
        const userResponse = await notionApi.users.me(apiKey);
        console.log('✅ Test Notion - Connexion réussie:', userResponse.name);
        
        // Mise à jour du statut de connexion
        setTestResults(prev => ({
          ...prev,
          connection: 'success',
          projectsTable: 'loading'
        }));

        // Test 2: Tester l'accès à la base de données des projets
        try {
          console.log('🧪 Test Notion - Vérification de la base de données:', dbId);
          const dbResponse = await notionApi.databases.retrieve(dbId, apiKey);
          console.log('✅ Test Notion - Base de données accessible:', dbResponse.title[0]?.plain_text || dbId);

          // Maintenant, tester la requête sur cette base de données
          console.log('🧪 Test Notion - Requête sur la base de données des projets');
          const queryResponse = await notionApi.databases.query(dbId, {
            page_size: 10
          }, apiKey);

          console.log('✅ Test Notion - Requête réussie, projets trouvés:', queryResponse.results.length);

          // Mise à jour du statut des projets
          setTestResults(prev => ({
            ...prev,
            projectsTable: 'success',
            checklistsTable: 'loading',
            projectsCount: queryResponse.results.length
          }));

          // Test 3: Vérifier si on peut trouver une base de données de checklist liée
          // Note: Ceci est un test simplifié, car normalement on aurait besoin de connaître
          // l'ID de la base de données des checklists
          try {
            console.log('🧪 Test Notion - Recherche des bases de données liées');
            
            // Requête pour obtenir les premières bases de données accessibles
            // Ceci est un test très simple qui vérifie juste si on peut lister des bases de données
            const response = await notionApi.databases.list(apiKey);
            console.log('✅ Test Notion - Bases de données accessibles:', response.results.length);

            setTestResults(prev => ({
              ...prev,
              checklistsTable: 'success',
              checklistsCount: response.results.length
            }));

          } catch (checklistError) {
            console.error('❌ Test Notion - Erreur accès checklists:', checklistError);
            setTestResults(prev => ({
              ...prev,
              checklistsTable: 'error',
              error: `Erreur lors de la recherche des checklists: ${checklistError.message || 'Erreur inconnue'}`
            }));
          }

        } catch (dbError) {
          console.error('❌ Test Notion - Erreur accès base de données:', dbError);
          setTestResults(prev => ({
            ...prev,
            projectsTable: 'error',
            checklistsTable: 'idle',
            error: `Erreur d'accès à la base de données: ${dbError.message || 'Erreur inconnue'}`
          }));
        }

      } catch (connectionError) {
        console.error('❌ Test Notion - Erreur de connexion:', connectionError);
        setTestResults({
          connection: 'error',
          projectsTable: 'idle',
          checklistsTable: 'idle',
          error: `Erreur de connexion à l'API Notion: ${connectionError.message || 'Erreur inconnue'}`
        });

        // Si l'erreur est liée à CORS (Failed to fetch), proposer d'activer le mode mock
        if (connectionError.message?.includes('Failed to fetch')) {
          toast.error('Erreur CORS détectée', {
            description: 'Le navigateur bloque l\'accès direct à l\'API Notion pour des raisons de sécurité.',
            action: {
              label: 'Activer le mode démo',
              onClick: () => {
                notionApi.mockMode.activate();
                toast.success('Mode démo activé', {
                  description: 'L\'application utilise maintenant des données fictives.'
                });
              }
            }
          });
        }
      }

    } catch (error) {
      console.error('❌ Test Notion - Erreur globale:', error);
      setTestResults({
        connection: 'error',
        projectsTable: 'idle',
        checklistsTable: 'idle',
        error: `Erreur lors du test: ${error.message || 'Erreur inconnue'}`
      });
    }
  };

  const resetMockMode = () => {
    notionApi.mockMode.reset();
    toast.success('Mode mock réinitialisé', {
      description: 'Les paramètres de connexion à Notion ont été réinitialisés.'
    });
    setIsOpen(false);
  };

  const getStatusIcon = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'idle':
        return <span className="w-5 h-5 inline-block"></span>;
      case 'loading':
        return <div className="w-5 h-5 border-2 border-t-transparent border-tmw-teal rounded-full animate-spin"></div>;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
        onClick={() => setIsOpen(true)}
      >
        <Bug size={16} />
        Test Notion
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Test de connexion Notion</DialogTitle>
            <DialogDescription>
              Vérifiez si votre configuration Notion est correctement établie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Statut du mode mock */}
            <div className={`p-3 rounded-md text-sm ${notionApi.mockMode.isActive() 
              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
              : 'bg-green-50 text-green-800 border border-green-200'}`}>
              <div className="font-medium flex items-center gap-2">
                <Database size={16} />
                Mode actuel: {notionApi.mockMode.isActive() ? 'Démonstration (mock)' : 'Réel'}
              </div>
              <p className="text-xs mt-1">
                {notionApi.mockMode.isActive() 
                  ? 'L\'application utilise actuellement des données fictives.' 
                  : 'L\'application est configurée pour utiliser l\'API Notion.'}
              </p>
            </div>

            {/* Résultats des tests */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium text-sm">Résultats des tests</div>
              <div className="divide-y">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium">Connexion à l'API</span>
                  <span>{getStatusIcon(testResults.connection)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium">Base de données des projets</span>
                  <div className="flex items-center gap-2">
                    {testResults.projectsCount !== undefined && testResults.projectsTable === 'success' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        {testResults.projectsCount} projet(s)
                      </span>
                    )}
                    {getStatusIcon(testResults.projectsTable)}
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium">Autres bases de données</span>
                  <div className="flex items-center gap-2">
                    {testResults.checklistsCount !== undefined && testResults.checklistsTable === 'success' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        {testResults.checklistsCount} trouvée(s)
                      </span>
                    )}
                    {getStatusIcon(testResults.checklistsTable)}
                  </div>
                </div>
              </div>
            </div>

            {/* Message d'erreur */}
            {testResults.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                <div className="font-medium">Erreur détectée :</div>
                <p className="text-xs mt-1 break-all">{testResults.error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetMockMode}
              >
                Réinitialiser le mode
              </Button>
              <Button 
                onClick={runTest}
                className="bg-tmw-teal hover:bg-tmw-teal/90"
              >
                Lancer le test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotionTestButton;
