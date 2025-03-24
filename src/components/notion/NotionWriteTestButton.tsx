
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check, XCircle, AlertTriangle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { 
  prepareRealModeTest, 
  createTestPageData, 
  enrichWithRequiredProperties, 
  NotionCreateData 
} from '@/utils/notionWriteTest';

interface NotionWriteTestButtonProps {
  onSuccess?: () => void;
}

const NotionWriteTestButton: React.FC<NotionWriteTestButtonProps> = ({ onSuccess }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleTestWrite = async () => {
    // Vérifier les valeurs dans localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    console.log('🔍 Démarrage du test d\'écriture avec:', {
      'API Key présente': !!apiKey,
      'Database ID présent': !!dbId,
      'API Key (début)': apiKey ? apiKey.substring(0, 8) + '...' : 'non définie',
      'Database ID': dbId || 'non défini'
    });
    
    if (!apiKey || !dbId) {
      toast.error('Configuration Notion requise', {
        description: 'Veuillez d\'abord configurer votre clé API et votre base de données Notion.'
      });
      return;
    }
    
    setIsTesting(true);
    setTestStatus('idle');
    
    try {
      // Forcer le mode réel pour ce test
      prepareRealModeTest();
      
      // Créer un objet de test avec un timestamp pour garantir l'unicité
      const timestamp = new Date().toISOString();
      const testTitle = `Test d'écriture ${timestamp}`;
      
      console.log(`📝 Tentative d'écriture dans Notion: "${testTitle}"`);
      console.log(`📝 Utilisation de la base de données: "${dbId}"`);
      console.log(`📝 Utilisation de la clé API: "${apiKey.substring(0, 8)}..."`);
      
      // Récupérer d'abord la structure de la base de données
      console.log('1️⃣ Récupération de la structure de la base de données...');
      try {
        const dbDetails = await notionApi.databases.retrieve(dbId, apiKey);
        console.log('✅ Structure récupérée:', dbDetails);
        
        // Extraire le titre de la base de données
        const dbTitle = dbDetails.title?.[0]?.plain_text || dbId;
        console.log(`📊 Base de données: "${dbTitle}"`);
        
        // Analyser les propriétés pour trouver celles requises et leurs types
        console.log('2️⃣ Analyse des propriétés de la base de données...');
        const properties = dbDetails.properties || {};
        
        // Trouver la propriété titre
        const titleProperty = Object.entries(properties).find(([_, prop]) => prop.type === 'title')?.[0];
        console.log(`🔑 Propriété titre identifiée: "${titleProperty || 'Name'}"`);
        
        // Résumé des propriétés
        const propsSummary = Object.entries(properties)
          .map(([name, prop]) => `${name} (${prop.type})`)
          .join(', ');
        
        console.log(`📊 Propriétés disponibles: ${propsSummary}`);
      } catch (dbError) {
        console.error('❌ Erreur lors de la récupération de la structure:', dbError);
        console.log('⚠️ Continuation avec une structure générique...');
      }
      
      // Créer les données de test de base
      let createData = createTestPageData(timestamp);
      createData.parent.database_id = dbId;
      
      // Enrichir avec les propriétés requises
      console.log('3️⃣ Enrichissement des données avec propriétés requises...');
      createData = await enrichWithRequiredProperties(createData, dbId, apiKey);
      
      console.log('📡 Envoi FINAL de la requête avec données:', JSON.stringify(createData, null, 2));
      
      // Tenter de créer la page
      const response = await notionApi.pages.create(createData, apiKey);
      
      if (response && response.id) {
        console.log('✅ Test d\'écriture réussi! ID de la page créée:', response.id);
        
        // Vérifier en lisant la page créée
        console.log('4️⃣ Vérification de la page créée...');
        const pageData = await notionApi.pages.retrieve(response.id, apiKey);
        
        if (pageData && pageData.id === response.id) {
          console.log('✅ Lecture de la page créée réussie!');
          console.log('📄 Données de la page créée:', pageData);
          
          // Archiver la page de test
          console.log('5️⃣ Archivage de la page de test...');
          try {
            await notionApi.pages.update(response.id, {
              archived: true
            }, apiKey);
            console.log('🧹 Nettoyage: Page de test archivée');
          } catch (cleanupError) {
            console.error('⚠️ Impossible d\'archiver la page de test:', cleanupError);
          }
          
          setTestStatus('success');
          toast.success('Test d\'écriture réussi', {
            description: 'Une page de test a été créée et lue avec succès dans votre base de données Notion.'
          });
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          console.error('❌ Échec de la lecture après écriture:', pageData);
          throw new Error('Échec de la lecture après écriture');
        }
      } else {
        console.error('❌ Réponse de création invalide:', response);
        throw new Error('La création a échoué (pas d\'ID retourné)');
      }
    } catch (error) {
      console.error('❌ Test d\'écriture Notion échoué:', error);
      
      setTestStatus('error');
      
      // Afficher un message d'erreur adapté selon le type d'erreur
      let errorMessage = 'Échec du test d\'écriture';
      let errorDescription = '';
      
      if (error.message?.includes('401')) {
        errorMessage = 'Authentification échouée';
        errorDescription = 'Vérifiez votre clé API. Elle peut être invalide ou expirée.';
      } else if (error.message?.includes('403')) {
        errorMessage = 'Accès refusé';
        errorDescription = 'Vérifiez que votre intégration Notion a les permissions d\'écriture.';
      } else if (error.message?.includes('404')) {
        errorMessage = 'Base de données introuvable';
        errorDescription = 'Vérifiez l\'ID de base de données et assurez-vous qu\'elle existe toujours.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('network') || error.message?.includes('CORS')) {
        errorMessage = 'Problème de réseau';
        errorDescription = 'Erreur CORS ou connexion internet. Le proxy ne fonctionne peut-être pas correctement.';
      } else if (error.message?.includes('required') || error.message?.includes('validation_error')) {
        errorMessage = 'Erreur de validation';
        errorDescription = 'Structure de données incorrecte. Certains champs requis peuvent manquer.';
      } else {
        errorDescription = error.message || 'Erreur inconnue lors du test d\'écriture.';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 8000,
        action: {
          label: 'Réinitialiser',
          onClick: () => {
            notionApi.mockMode.forceReset();
            setTimeout(() => window.location.reload(), 500);
          }
        }
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${
        testStatus === 'success' 
          ? 'text-green-600 border-green-300 hover:bg-green-50' 
          : testStatus === 'error'
          ? 'text-red-600 border-red-300 hover:bg-red-50'
          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
      }`}
      onClick={handleTestWrite}
      disabled={isTesting}
    >
      {isTesting ? (
        <RotateCw size={16} className="animate-spin" />
      ) : testStatus === 'success' ? (
        <Check size={16} />
      ) : testStatus === 'error' ? (
        <XCircle size={16} />
      ) : (
        <AlertTriangle size={16} />
      )}
      Test d'écriture
    </Button>
  );
};

export default NotionWriteTestButton;
