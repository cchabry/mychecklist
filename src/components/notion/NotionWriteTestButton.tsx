
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check, XCircle, AlertTriangle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

interface NotionWriteTestButtonProps {
  onSuccess?: () => void;
}

// Define the type for the Notion page creation data
interface NotionCreateData {
  parent: { database_id: string };
  properties: {
    Name: { title: { text: { content: string } }[] };
    Status: { select: { name: string } };
    [key: string]: any; // Allow for additional dynamic properties
  };
}

const NotionWriteTestButton: React.FC<NotionWriteTestButtonProps> = ({ onSuccess }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleTestWrite = async () => {
    // Toujours vérifier d'abord les valeurs dans localStorage
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
      // Forcer le mode réel pour ce test et désactiver complètement le mode mock
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      localStorage.removeItem('notion_last_error');
      notionApi.mockMode.forceReset();
      console.log('🔄 Test d\'écriture: Mode réel forcé temporairement');
      
      // Créer un objet de test avec un timestamp pour garantir l'unicité
      const timestamp = new Date().toISOString();
      const testTitle = `Test d'écriture ${timestamp}`;
      
      console.log(`📝 Tentative d'écriture dans Notion: "${testTitle}"`);
      console.log(`📝 Utilisation de la base de données: "${dbId}"`);
      console.log(`📝 Utilisation de la clé API: "${apiKey.substring(0, 8)}..."`);
      
      // Préparation des données pour la création de page
      const createData: NotionCreateData = {
        parent: { database_id: dbId },
        properties: {
          Name: {
            title: [{ text: { content: testTitle } }]
          },
          Status: {
            select: { name: "Test" }
          }
        }
      };
      
      console.log('📋 Structure de données pour la création:', JSON.stringify(createData, null, 2));
      
      // Ajouter d'autres propriétés courantes au cas où elles sont requises
      try {
        // Tenter d'ajouter une propriété URL (optionnelle)
        createData.properties.URL = {
          url: "https://test.example.com"
        };
        
        // Tenter d'ajouter d'autres propriétés courantes
        try {
          createData.properties.Description = {
            rich_text: [{ text: { content: "Description de test automatique" } }]
          };
        } catch (e) {
          console.log('ℹ️ La propriété Description n\'est peut-être pas supportée');
        }
        
        try {
          createData.properties.Tags = {
            multi_select: [{ name: "Test" }]
          };
        } catch (e) {
          console.log('ℹ️ La propriété Tags n\'est peut-être pas supportée');
        }
        
      } catch (e) {
        // Ignorer si la propriété URL n'est pas supportée
        console.log('ℹ️ La propriété URL n\'est peut-être pas supportée par cette base de données');
      }
      
      // Tentative de création via le proxy
      console.log('📡 Envoi de la requête de création avec les données:', JSON.stringify(createData, null, 2));
      
      // Tester la structure des propriétés de la base de données
      try {
        console.log('🔍 Vérification de la structure de la base de données avant création...');
        const dbDetails = await notionApi.databases.retrieve(dbId, apiKey);
        console.log('✅ Structure de la base de données récupérée:', JSON.stringify(dbDetails.properties, null, 2));
        
        // Analyser les propriétés requises de la base de données
        const requiredProps = Object.entries(dbDetails.properties)
          .filter(([_, prop]: [string, any]) => prop.type === 'title' || (prop.type === 'rich_text' && prop.rich_text?.is_required))
          .map(([name, _]: [string, any]) => name);
          
        console.log('⚠️ Propriétés potentiellement requises dans la base:', requiredProps);
        
        // Assurer que toutes les propriétés requises sont présentes
        if (requiredProps.length > 0) {
          for (const propName of requiredProps) {
            if (!createData.properties[propName]) {
              if (propName === 'Name' || propName === 'Nom' || propName === 'Title' || propName === 'Titre') {
                // Déjà défini comme Name, mais peut-être que la base utilise un nom différent
                createData.properties[propName] = createData.properties.Name;
                console.log(`🔄 Ajout de la propriété requise "${propName}" (copie de Name)`);
              } else {
                // Ajouter une valeur par défaut pour cette propriété requise
                createData.properties[propName] = {
                  rich_text: [{ text: { content: "Valeur de test requise" } }]
                };
                console.log(`🔄 Ajout de valeur par défaut pour la propriété requise "${propName}"`);
              }
            }
          }
        }
      } catch (dbError) {
        console.error('❌ Erreur lors de la vérification de la structure de la base:', dbError);
        // Continuer quand même, car l'erreur pourrait venir d'autre chose
      }
      
      console.log('📡 Envoi FINAL de la requête avec données:', JSON.stringify(createData, null, 2));
      
      const response = await notionApi.pages.create(createData, apiKey);
      
      if (response && response.id) {
        console.log('✅ Test d\'écriture réussi! ID de la page créée:', response.id);
        
        // On essaie maintenant de lire la page qu'on vient de créer pour vérifier
        const pageData = await notionApi.pages.retrieve(response.id, apiKey);
        
        if (pageData && pageData.id === response.id) {
          console.log('✅ Lecture de la page créée réussie!');
          setTestStatus('success');
          toast.success('Test d\'écriture réussi', {
            description: 'Une page de test a été créée et lue avec succès dans votre base de données Notion.'
          });
          
          // Supprimer la page de test si possible (optionnel, pas bloquant)
          try {
            // Tentative de "suppression" (archive) via mise à jour
            await notionApi.pages.update(response.id, {
              archived: true
            }, apiKey);
            console.log('🧹 Nettoyage: Page de test archivée');
          } catch (cleanupError) {
            console.log('⚠️ Impossible d\'archiver la page de test:', cleanupError);
            // On ne bloque pas le flux en cas d'échec de nettoyage
          }
          
          // Appeler le callback onSuccess si fourni
          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error('Échec de la lecture après écriture');
        }
      } else {
        throw new Error('La création a échoué (pas d\'ID retourné)');
      }
    } catch (error) {
      console.error('❌ Test d\'écriture Notion échoué:', error);
      console.error('❌ Message d\'erreur complet:', error.message);
      
      // Détails supplémentaires sur l'erreur
      if (error.response) {
        console.error('❌ Données de réponse:', JSON.stringify(error.response, null, 2));
      }
      
      setTestStatus('error');
      
      // Afficher un message d'erreur détaillé et plus explicite
      let errorMessage = 'Échec du test d\'écriture';
      let errorDescription = '';
      
      if (error.message?.includes('401')) {
        errorMessage = 'Authentification échouée';
        errorDescription = 'Vérifiez votre clé API. Elle peut être invalide ou expirée.';
      } else if (error.message?.includes('403')) {
        errorMessage = 'Accès refusé';
        errorDescription = 'Vérifiez que votre intégration Notion a les permissions d\'écriture et a été correctement connectée à votre base de données dans le menu "..." > "Connexions".';
      } else if (error.message?.includes('404')) {
        errorMessage = 'Base de données introuvable';
        errorDescription = 'Vérifiez l\'ID de base de données et assurez-vous qu\'elle existe toujours.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('network') || error.message?.includes('CORS')) {
        errorMessage = 'Problème de réseau';
        errorDescription = 'Erreur CORS ou connexion internet. Le proxy ne fonctionne peut-être pas correctement. Vérifiez que le proxy est correctement déployé.';
      } else if (error.message?.includes('required') || error.message?.includes('validation_error')) {
        errorMessage = 'Erreur de validation';
        errorDescription = 'Structure de données incorrecte. Certains champs requis peuvent manquer ou être mal formatés.';
        
        // Ajouter des détails sur l'erreur
        if (error.message) {
          errorDescription += '\nDétails: ' + error.message;
        }
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
            localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
            localStorage.removeItem('notion_last_error');
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
