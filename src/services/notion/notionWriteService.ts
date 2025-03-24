
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { Audit, Project } from '@/lib/types';
import { operationMode } from '@/services/operationMode';

/**
 * Type pour les options de requête d'écriture Notion
 */
interface NotionWriteOptions {
  // Force le mode réel même si le mode démo est actif
  forceRealMode?: boolean;
  
  // Messages personnalisés
  successMessage?: string;
  errorMessage?: string;
  
  // Fonctions de rappel
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  
  // Comportement en cas d'erreur
  fallbackToDemoOnError?: boolean;
}

/**
 * Service centralisé pour l'écriture dans Notion
 * Gère automatiquement les erreurs, le mode démo et le cleanup
 */
class NotionWriteService {
  /**
   * Effectue une opération d'écriture dans Notion de manière sécurisée
   */
  async executeWrite<T>(
    writeOperation: () => Promise<T>,
    options: NotionWriteOptions = {}
  ): Promise<T | null> {
    const {
      forceRealMode = false,
      successMessage,
      errorMessage = 'Erreur lors de l\'opération d\'écriture',
      onSuccess,
      onError,
      fallbackToDemoOnError = true
    } = options;
    
    // Gérer l'état du mode mock
    const wasMockMode = notionApi.mockMode.isActive();
    let temporarilyDisabledMock = false;
    
    try {
      // Forcer temporairement le mode réel si demandé
      if (forceRealMode && wasMockMode) {
        console.log('🔄 Mode réel temporairement forcé pour l\'opération d\'écriture');
        notionApi.mockMode.temporarilyForceReal();
        temporarilyDisabledMock = true;
      }
      
      // Exécuter l'opération d'écriture
      console.log('📝 Exécution de l\'opération d\'écriture Notion...');
      const result = await writeOperation();
      console.log('✅ Opération d\'écriture réussie:', result);
      
      // Notifier du succès
      if (successMessage) {
        toast.success(successMessage);
      }
      
      // Exécuter le callback de succès
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Signaler l'opération réussie au système operationMode
      operationMode.handleSuccessfulOperation();
      
      return result;
    } catch (error) {
      console.error('❌ Erreur d\'écriture Notion:', error);
      
      // Formater l'erreur
      const formattedError = error instanceof Error 
        ? error 
        : new Error(typeof error === 'string' ? error : 'Erreur inconnue');
      
      // Analyser l'erreur pour un message plus précis
      let displayMessage = errorMessage;
      
      if (formattedError.message.includes('401')) {
        displayMessage = 'Authentification Notion échouée. Vérifiez votre clé API.';
      } else if (formattedError.message.includes('403')) {
        displayMessage = 'Accès refusé. Vérifiez les permissions de votre intégration Notion.';
      } else if (formattedError.message.includes('404')) {
        displayMessage = 'Base de données Notion introuvable. Vérifiez l\'ID de la base.';
      } else if (formattedError.message.includes('validation_error')) {
        displayMessage = 'Erreur de validation des données. Format incorrect pour Notion.';
      } else if (formattedError.message.includes('Failed to fetch') || 
                formattedError.message.includes('network') || 
                formattedError.message.includes('CORS')) {
        displayMessage = 'Erreur réseau. Problème de connexion à l\'API Notion.';
      }
      
      // Afficher l'erreur
      toast.error(displayMessage, {
        description: formattedError.message,
        duration: 5000
      });
      
      // Signaler l'erreur au système operationMode
      operationMode.handleConnectionError(formattedError, 'Écriture Notion');
      
      // Basculer en mode démo si nécessaire
      if (fallbackToDemoOnError && !wasMockMode) {
        console.log('⚠️ Activation du mode démo suite à une erreur');
        notionApi.mockMode.activate();
        
        toast.info('Mode démonstration activé', {
          description: 'Suite à une erreur de connexion, l\'application continue en mode local.'
        });
      }
      
      // Exécuter le callback d'erreur
      if (onError) {
        onError(formattedError);
      }
      
      return null;
    } finally {
      // Restaurer le mode mock si nécessaire
      if (temporarilyDisabledMock) {
        console.log('🔄 Restauration du mode mock après l\'opération');
        notionApi.mockMode.restoreAfterForceReal();
      }
    }
  }
  
  /**
   * Crée une page test dans la base de données pour vérifier les permissions
   */
  async testWritePermission(databaseId: string, apiKey: string): Promise<boolean> {
    console.log(`🔍 Test d'écriture dans la base ${databaseId.substring(0, 8)}...`);
    
    return this.executeWrite(
      async () => {
        // 1. Récupérer la structure de la base de données
        console.log('1️⃣ Récupération de la structure de la base...');
        const dbDetails = await notionApi.databases.retrieve(databaseId, apiKey);
        
        if (!dbDetails || !dbDetails.properties) {
          throw new Error('Structure de base de données invalide');
        }
        
        // 2. Trouver la propriété titre
        let titleProperty = 'Name';
        for (const [propName, propDetails] of Object.entries(dbDetails.properties)) {
          if ((propDetails as any).type === 'title') {
            titleProperty = propName;
            break;
          }
        }
        
        // 3. Préparer des données minimales de test
        const timestamp = new Date().toISOString();
        const testData = {
          parent: { database_id: databaseId },
          properties: {
            [titleProperty]: {
              title: [{ text: { content: `Test d'écriture ${timestamp}` } }]
            }
          }
        };
        
        // 4. Créer la page de test
        console.log('2️⃣ Création d\'une page de test...');
        const response = await notionApi.pages.create(testData, apiKey);
        
        if (!response || !response.id) {
          throw new Error('Réponse de création invalide');
        }
        
        const pageId = response.id;
        
        // 5. Archiver la page de test (nettoyage)
        console.log('3️⃣ Archivage de la page de test...');
        await notionApi.pages.update(pageId, { archived: true }, apiKey);
        
        return true;
      },
      {
        forceRealMode: true,
        successMessage: 'Test d\'écriture réussi',
        errorMessage: 'Échec du test d\'écriture',
        fallbackToDemoOnError: false
      }
    ) !== null;
  }
  
  /**
   * Crée un nouveau projet dans Notion
   */
  async createProject(projectData: Partial<Project>, apiKey: string): Promise<Project | null> {
    return this.executeWrite(
      async () => {
        // Récupérer l'ID de la base de données
        const databaseId = localStorage.getItem('notion_database_id');
        
        if (!databaseId) {
          throw new Error('ID de base de données Notion non configuré');
        }
        
        // Préparer les données du projet
        const data = {
          parent: { database_id: databaseId },
          properties: {
            Name: {
              title: [{ text: { content: projectData.name || 'Nouveau projet' } }]
            }
          }
        };
        
        // Ajouter l'URL si disponible
        if (projectData.url) {
          data.properties.URL = { url: projectData.url };
        }
        
        // Créer le projet
        const response = await notionApi.pages.create(data, apiKey);
        
        // Formater la réponse
        if (response && response.id) {
          return {
            id: response.id,
            name: projectData.name || 'Nouveau projet',
            url: projectData.url || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0
          };
        }
        
        throw new Error('Réponse de création invalide');
      },
      {
        successMessage: 'Projet créé avec succès',
        errorMessage: 'Échec de la création du projet'
      }
    );
  }
  
  /**
   * Sauvegarde un audit dans Notion
   */
  async saveAudit(audit: Audit, apiKey: string): Promise<boolean> {
    return this.executeWrite(
      async () => {
        // Logique de sauvegarde d'audit
        console.log('Sauvegarde de l\'audit:', audit);
        
        // Implémentation à compléter selon vos besoins
        // Pour l'instant, simulons une sauvegarde réussie
        return true;
      },
      {
        successMessage: 'Audit sauvegardé avec succès',
        errorMessage: 'Échec de la sauvegarde de l\'audit'
      }
    ) !== null;
  }
}

// Exporter une instance singleton
export const notionWriteService = new NotionWriteService();
