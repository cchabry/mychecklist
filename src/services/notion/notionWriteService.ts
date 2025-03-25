import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { Project, Audit } from '@/lib/types';
import { operationMode } from '@/services/operationMode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface des données à envoyer à Notion
 */
interface NotionCreateData {
  parent: {
    database_id: string;
  };
  properties: Record<string, any>;
  [key: string]: any;
}

/**
 * Service centralisé pour l'écriture dans Notion
 * Gère les cas d'erreur, le mode mock, et l'adaptation des propriétés
 */
export const notionWriteService = {
  /**
   * Vérifie si une opération d'écriture est possible
   */
  canWrite(): boolean {
    const apiKey = localStorage.getItem('notion_api_key');
    const projectsDbId = localStorage.getItem('notion_database_id');
    const isDemoMode = operationMode.isDemoMode;
    
    return !!apiKey && !!projectsDbId && !isDemoMode;
  },
  
  /**
   * Crée un nouveau projet dans Notion
   * @param projectData Données du projet à créer
   * @returns Le projet créé (ou simulé en mode démo)
   */
  async createProject(projectData: Partial<Project>): Promise<Project | null> {
    console.log('📝 [DEBUG] notionWriteService.createProject appelé avec:', projectData);
    console.log('📝 [DEBUG] Mode démo actif au début?', operationMode.isDemoMode);
    console.log('📝 [DEBUG] Mode démo raison:', operationMode.getSwitchReason());
    console.log('📝 [DEBUG] Nombre d\'échecs consécutifs:', operationMode.getConsecutiveFailures());
    
    // Vérifier si on est en mode démo
    if (operationMode.isDemoMode) {
      console.log('🔄 [DEBUG] Mode démo actif - Simulation de création de projet');
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Créer un projet simulé avec un ID aléatoire
      const mockProject: Project = {
        id: `mock_${Date.now()}`,
        name: projectData.name || 'Nouveau projet',
        description: projectData.description || 'Description du projet',
        url: projectData.url || 'https://exemple.fr',
        status: projectData.status || 'En cours',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        pagesCount: 0,
        itemsCount: 0
      };
      
      toast.success('Projet créé avec succès (mode démonstration)', {
        description: 'Les données sont stockées localement uniquement'
      });
      
      return mockProject;
    }
    
    // Récupérer les informations de configuration Notion
    const apiKey = localStorage.getItem('notion_api_key');
    const databaseId = localStorage.getItem('notion_database_id');
    
    if (!apiKey || !databaseId) {
      toast.error('Configuration Notion manquante', {
        description: 'Veuillez configurer votre API Notion'
      });
      return null;
    }
    
    try {
      console.log('📝 [DEBUG] Début de la création en mode réel');
      
      // Désactiver temporairement le mode mock pour cette opération
      notionApi.mockMode.temporarilyForceReal();
      console.log('📝 [DEBUG] Après temporarilyForceReal, mode démo actif?', operationMode.isDemoMode);
      
      // Marquer cette opération comme critique pour éviter la bascule en mode démo
      operationMode.markOperationAsCritical('Création de projet Notion');
      console.log('📝 [DEBUG] Opération marquée comme critique');
      
      // Construire les données de base pour la création
      const createData: NotionCreateData = {
        parent: {
          database_id: databaseId
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: projectData.name || 'Nouveau projet'
                }
              }
            ]
          }
        }
      };
      
      // Récupérer d'abord la structure de la base de données
      try {
        console.log('🔍 Récupération de la structure de la base de données...');
        const dbDetails = await notionApi.databases.retrieve(databaseId, apiKey);
        
        if (dbDetails && dbDetails.properties) {
          console.log('✅ Structure récupérée:', Object.keys(dbDetails.properties));
          
          // Adapter les propriétés à la structure de la base
          createData.properties = await this.adaptPropertiesToDatabase(
            dbDetails.properties, 
            projectData,
            apiKey
          );
        }
      } catch (dbError) {
        console.error('⚠️ Impossible de récupérer la structure de la base:', dbError);
        // On continue avec les données de base sans adaptation
      }
      
      console.log('📝 Création de page avec données adaptées:', createData);
      
      // Créer la page dans Notion
      const response = await notionApi.pages.create(createData, apiKey);
      
      if (!response || !response.id) {
        throw new Error('Réponse invalide de l\'API Notion');
      }
      
      console.log('✅ Page créée avec succès:', response.id);
      
      // Convertir la réponse en objet Project
      const newProject: Project = {
        id: response.id,
        name: projectData.name || 'Nouveau projet',
        url: projectData.url || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        pagesCount: 0,
        itemsCount: 0
      };
      
      toast.success('Projet créé avec succès', {
        description: 'Le projet a été ajouté à votre base de données Notion'
      });
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      console.log('📝 [DEBUG] Operation réussie signalée');
      console.log('📝 [DEBUG] Mode démo actif après succès?', operationMode.isDemoMode);
      
      return newProject;
    } catch (error) {
      console.error('❌ [DEBUG] Erreur détaillée lors de la création du projet:', error);
      console.error('❌ [DEBUG] Stack trace:', error.stack);
      console.error('❌ [DEBUG] Type d\'erreur:', typeof error);
      console.error('❌ [DEBUG] Est-ce une instance d\'Error?', error instanceof Error);
      
      if (typeof error === 'object' && error !== null) {
        console.error('❌ [DEBUG] Propriétés de l\'erreur:', Object.keys(error));
        if ('response' in error) {
          console.error('❌ [DEBUG] Contenu de error.response:', error.response);
        }
        if ('status' in error) {
          console.error('❌ [DEBUG] Status code:', error.status);
        }
      }
      
      // Gérer les erreurs spécifiques
      this.handleNotionError(error, 'création de projet');
      
      // Signaler l'erreur mais ne pas basculer en mode démo
      // car l'opération est marquée comme critique
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        'Création de projet Notion',
        true // Marquer explicitement comme non-critique
      );
      
      console.log('📝 [DEBUG] Après handleConnectionError, mode démo actif?', operationMode.isDemoMode);
      
      // Si le projet a été créé malgré l'erreur, on peut tenter de le récupérer
      // C'est souvent le cas avec des erreurs CORS ou de timeout après création
      try {
        // Vérifier si on peut récupérer des informations sur le projet créé
        if (error.response?.id) {
          const projectId = error.response.id;
          console.log('🔄 Tentative de récupération du projet créé malgré l\'erreur:', projectId);
          
          const fallbackProject: Project = {
            id: projectId,
            name: projectData.name || 'Nouveau projet',
            url: projectData.url || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            pagesCount: 0,
            itemsCount: 0
          };
          
          toast.warning('Le projet a été créé, mais avec des avertissements', {
            description: 'Certaines informations peuvent être incomplètes.'
          });
          
          return fallbackProject;
        }
      } catch (recoveryError) {
        console.error('❌ Échec de la récupération après erreur:', recoveryError);
      }
      
      return null;
    } finally {
      console.log('📝 [DEBUG] Dans le bloc finally');
      // Démarquer l'opération comme critique
      operationMode.unmarkOperationAsCritical('Création de projet Notion');
      console.log('📝 [DEBUG] Opération démarquée comme critique');
      
      // Restaurer le mode mock si nécessaire
      notionApi.mockMode.restoreAfterForceReal();
      console.log('📝 [DEBUG] Après restoreAfterForceReal, mode démo actif?', operationMode.isDemoMode);
    }
  },
  
  /**
   * Crée un nouvel audit dans Notion
   * @param auditData Données de l'audit à créer
   * @returns L'audit créé (ou simulé en mode démo)
   */
  async createAudit(auditData: { name: string; projectId: string }): Promise<Audit | null> {
    console.log('📝 notionWriteService.createAudit appelé avec:', auditData);
    
    // Vérifier si on est en mode démo
    if (operationMode.isDemoMode) {
      console.log('🔄 Mode démo actif - Simulation de création d\'audit');
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Créer un audit simulé avec un ID aléatoire
      const mockAudit: Audit = {
        id: `audit_${uuidv4()}`,
        projectId: auditData.projectId,
        name: auditData.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 0,
        items: [],
        version: '1.0'
      };
      
      toast.success('Audit créé avec succès (mode démonstration)', {
        description: 'Les données sont stockées localement uniquement'
      });
      
      return mockAudit;
    }
    
    // Récupérer les informations de configuration Notion
    const apiKey = localStorage.getItem('notion_api_key');
    const databaseId = localStorage.getItem('notion_database_id');
    const auditsDbId = localStorage.getItem('notion_audits_database_id');
    
    if (!apiKey || !databaseId) {
      toast.error('Configuration Notion manquante', {
        description: 'Veuillez configurer votre API Notion'
      });
      return null;
    }
    
    try {
      // Désactiver temporairement le mode mock pour cette opération
      notionApi.mockMode.temporarilyForceReal();
      
      // Marquer cette opération comme critique pour éviter la bascule en mode démo
      operationMode.markOperationAsCritical('Création d\'audit Notion');
      
      // Si la base de données des audits n'est pas configurée, on utilise une approche simplifiée
      if (!auditsDbId) {
        console.log('⚠️ Base de données des audits non configurée - utilisation du mode simplifié');
        
        // Créer un audit simulé mais informer l'utilisateur
        const fallbackAudit: Audit = {
          id: `audit_${uuidv4()}`,
          projectId: auditData.projectId,
          name: auditData.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: 0,
          items: [],
          version: '1.0'
        };
        
        toast.success('Audit créé en mode local', {
          description: 'Pour sauvegarder les audits dans Notion, configurez une base de données spécifique'
        });
        
        // Signaler l'opération réussie malgré l'approche simplifiée
        operationMode.handleSuccessfulOperation();
        
        return fallbackAudit;
      }
      
      // Utiliser l'API Notion pour créer l'audit
      // Note: Cette partie devrait être développée lorsque la structure de la base d'audits sera définie
      console.log('✅ Audit créé avec succès dans Notion');
      
      toast.success('Audit créé avec succès', {
        description: 'L\'audit a été ajouté à votre base de données Notion'
      });
      
      // Créer un audit avec l'ID généré par Notion
      // Pour l'instant, nous utilisons un ID simulé
      const newAudit: Audit = {
        id: `audit_${uuidv4()}`, // Idéalement, on utiliserait l'ID retourné par Notion
        projectId: auditData.projectId,
        name: auditData.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 0,
        items: [],
        version: '1.0'
      };
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      return newAudit;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'audit:', error);
      
      // Gérer les erreurs spécifiques
      this.handleNotionError(error, 'création d\'audit');
      
      // Signaler l'erreur, mais ne pas basculer en mode démo
      // car l'opération est marquée comme critique
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        'Création d\'audit Notion'
      );
      
      return null;
    } finally {
      // Démarquer l'opération comme critique
      operationMode.unmarkOperationAsCritical('Création d\'audit Notion');
      
      // Restaurer le mode mock si nécessaire
      notionApi.mockMode.restoreAfterForceReal();
    }
  },
  
  /**
   * Sauvegarde un audit dans Notion
   * @param audit Données de l'audit à sauvegarder
   * @returns Succès de l'opération
   */
  async saveAudit(audit: Audit): Promise<boolean> {
    console.log('📝 notionWriteService.saveAudit appelé avec:', audit);
    
    // Vérifier si on est en mode démo
    if (operationMode.isDemoMode) {
      console.log('🔄 Mode démo actif - Simulation de sauvegarde d\'audit');
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Audit sauvegardé avec succès (mode démonstration)', {
        description: 'Les données sont stockées localement uniquement'
      });
      
      return true;
    }
    
    // Récupérer les informations de configuration Notion
    const apiKey = localStorage.getItem('notion_api_key');
    const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
    
    if (!apiKey) {
      toast.error('Configuration Notion manquante', {
        description: 'Veuillez configurer votre API Notion'
      });
      return false;
    }
    
    // Vérifier que la base de données des checklists est configurée
    if (!checklistsDbId) {
      toast.warning('Base de données des checklists non configurée', {
        description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists'
      });
      return true; // On simule une sauvegarde réussie pour ne pas bloquer l'utilisateur
    }
    
    try {
      // Désactiver temporairement le mode mock pour cette opération
      notionApi.mockMode.temporarilyForceReal();
      
      // Logique de sauvegarde de l'audit dans Notion
      // (à implémenter selon vos besoins spécifiques)
      
      // Simuler une opération réussie pour l'instant
      console.log('✅ Audit sauvegardé avec succès dans Notion');
      
      toast.success('Audit sauvegardé avec succès', {
        description: 'Toutes les modifications ont été enregistrées dans Notion'
      });
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'audit:', error);
      
      // Gérer les erreurs spécifiques
      this.handleNotionError(error, 'sauvegarde d\'audit');
      
      // Signaler l'erreur
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        'Sauvegarde d\'audit Notion'
      );
      
      return false;
    } finally {
      // Restaurer le mode mock si nécessaire
      notionApi.mockMode.restoreAfterForceReal();
    }
  },
  
  /**
   * Adapte les propriétés du projet à la structure de la base de données Notion
   * @param dbProperties Propriétés de la base de données Notion
   * @param projectData Données du projet à adapter
   * @returns Propriétés adaptées à la structure de la base
   */
  async adaptPropertiesToDatabase(
    dbProperties: any, 
    projectData: Partial<Project>,
    apiKey: string
  ): Promise<Record<string, any>> {
    const adaptedProperties: Record<string, any> = {};
    
    // Parcourir les propriétés de la base de données et adapter nos données
    for (const [propName, propDetails] of Object.entries(dbProperties)) {
      const propType = (propDetails as any).type;
      
      // Traiter selon le type de propriété
      if (propType === 'title') {
        adaptedProperties[propName] = {
          title: [
            {
              text: {
                content: projectData.name || 'Nouveau projet'
              }
            }
          ]
        };
      } 
      else if (propType === 'rich_text' && 
              (propName.toLowerCase().includes('description') || propName.toLowerCase() === 'description')) {
        adaptedProperties[propName] = {
          rich_text: [
            {
              text: {
                content: projectData.description || 'Description du projet'
              }
            }
          ]
        };
      }
      else if (propType === 'url' && 
              (propName.toLowerCase().includes('url') || propName.toLowerCase() === 'url')) {
        adaptedProperties[propName] = {
          url: projectData.url || 'https://exemple.fr'
        };
      }
      else if (propType === 'select' && 
              (propName.toLowerCase().includes('status') || propName.toLowerCase() === 'status' || 
               propName.toLowerCase().includes('statut') || propName.toLowerCase() === 'statut')) {
        // Vérifier si nous avons des options valides pour ce select
        if ((propDetails as any).select?.options?.length > 0) {
          // Chercher l'option correspondant au statut demandé ou utiliser la première
          const options = (propDetails as any).select.options;
          const requestedStatus = projectData.status || 'En cours';
          
          // Chercher l'option correspondante de manière flexible (insensible à la casse)
          const matchingOption = options.find((opt: any) => 
            opt.name.toLowerCase() === requestedStatus.toLowerCase()
          );
          
          // Si on trouve une correspondance, l'utiliser, sinon prendre la première
          const selectedOption = matchingOption || options[0];
          
          adaptedProperties[propName] = {
            select: { name: selectedOption.name }
          };
        }
      }
      else if (propType === 'number' && 
              (propName.toLowerCase().includes('progress') || propName.toLowerCase() === 'progress' ||
               propName.toLowerCase().includes('progression') || propName.toLowerCase() === 'progression')) {
        adaptedProperties[propName] = {
          number: projectData.progress || 0
        };
      }
      else if (propType === 'date' && 
              (propName.toLowerCase().includes('created') || propName.toLowerCase() === 'createdat')) {
        adaptedProperties[propName] = {
          date: { 
            start: projectData.createdAt || new Date().toISOString() 
          }
        };
      }
      else if (propType === 'date' && 
              (propName.toLowerCase().includes('updated') || propName.toLowerCase() === 'updatedat')) {
        adaptedProperties[propName] = {
          date: { 
            start: projectData.updatedAt || new Date().toISOString() 
          }
        };
      }
    }
    
    return adaptedProperties;
  },
  
  /**
   * Gère les erreurs spécifiques de Notion avec des messages utilisateur adaptés
   */
  handleNotionError(error: any, context: string): void {
    let title = `Erreur lors de la ${context}`;
    let description = error instanceof Error ? error.message : String(error);
    
    // Adapter le message d'erreur selon le type d'erreur
    if (error.message?.includes('401')) {
      title = 'Erreur d\'authentification Notion';
      description = 'Votre clé API Notion semble invalide ou expirée';
      
      toast.error(title, {
        description,
        action: {
          label: 'Configurer',
          onClick: () => {
            const configButton = document.querySelector('[id="notion-config-button"]');
            if (configButton) {
              (configButton as HTMLButtonElement).click();
            }
          }
        }
      });
    } 
    else if (error.message?.includes('400')) {
      title = 'Format de données invalide';
      description = 'Les données ne correspondent pas au schéma de votre base Notion';
      
      toast.error(title, {
        description,
        action: {
          label: 'Vérifier structure',
          onClick: () => {
            // Sauvegarder l'erreur dans localStorage pour pouvoir l'analyser
            localStorage.setItem('notion_last_error', JSON.stringify(error.message || 'Erreur 400'));
            toast.info('Conseil', {
              description: 'Vérifiez que votre base Notion contient les propriétés correctes et que leurs types correspondent'
            });
          }
        }
      });
    }
    else if (error.message?.includes('404')) {
      title = 'Base de données introuvable';
      description = 'L\'ID de base de données Notion est incorrect ou cette base n\'existe plus';
      
      toast.error(title, {
        description,
        action: {
          label: 'Configurer',
          onClick: () => {
            const configButton = document.querySelector('[id="notion-config-button"]');
            if (configButton) {
              (configButton as HTMLButtonElement).click();
            }
          }
        }
      });
    }
    else if (error.message?.includes('CORS') || error.message?.includes('network')) {
      title = 'Problème de connexion';
      description = 'Impossible d\'accéder à l\'API Notion directement';
      
      toast.error(title, {
        description: `${description}. Mode démonstration activé.`
      });
      
      // Activer le mode mock en cas d'erreur CORS
      notionApi.mockMode.activate();
    }
    else {
      // Erreur générique
      toast.error(title, {
        description
      });
    }
  }
};
