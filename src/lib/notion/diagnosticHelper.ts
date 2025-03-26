
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

/**
 * Utilitaire pour diagnostiquer et résoudre les problèmes de connexion à Notion
 */
export const notionDiagnostic = {
  /**
   * Vérifie la configuration Notion complète et teste les bases de données
   */
  async runFullDiagnostic(): Promise<DiagnosticResult> {
    // Désactiver temporairement le mode mock pour les tests
    const wasMockEnabled = notionApi.mockMode.isActive();
    if (wasMockEnabled) {
      notionApi.mockMode.forceReset();
      console.log('🔍 Diagnostic: Mode mock temporairement désactivé pour les tests');
    }
    
    const apiKey = localStorage.getItem('notion_api_key');
    const projectsDbId = localStorage.getItem('notion_database_id');
    const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
    
    if (!apiKey || !projectsDbId) {
      return {
        success: false,
        message: 'Configuration Notion incomplète',
        details: {
          hasApiKey: !!apiKey,
          hasProjectsDbId: !!projectsDbId,
          hasChecklistsDbId: !!checklistsDbId
        }
      };
    }
    
    try {
      // Tester la connexion à l'API Notion
      const user = await notionApi.users.me(apiKey);
      console.log('✅ Connexion à l\'API Notion réussie:', user.name);
      
      // Tester l'accès aux bases de données
      let databasesStatus = {
        projects: { success: false, name: '', error: '' },
        checklists: { success: false, name: '', error: '' }
      };
      
      // Tester la base de projets
      try {
        const projectsDb = await notionApi.databases.retrieve(projectsDbId, apiKey);
        databasesStatus.projects = {
          success: true,
          name: projectsDb.title?.[0]?.plain_text || projectsDbId,
          error: ''
        };
        console.log('✅ Accès à la base de projets réussi:', databasesStatus.projects.name);
        
        // Vérifier les propriétés essentielles pour les projets
        const missingProps = this.checkRequiredProperties(
          projectsDb.properties,
          ['Name', 'URL', 'Progress']
        );
        
        if (missingProps.length > 0) {
          console.warn('⚠️ Propriétés manquantes dans la base de projets:', missingProps);
          databasesStatus.projects.error = `Propriétés manquantes: ${missingProps.join(', ')}`;
        }
      } catch (error) {
        console.error('❌ Échec d\'accès à la base de projets:', error);
        databasesStatus.projects = {
          success: false,
          name: '',
          error: error.message || 'Erreur d\'accès à la base de projets'
        };
      }
      
      // Tester la base de checklists si configurée
      if (checklistsDbId) {
        try {
          const checklistsDb = await notionApi.databases.retrieve(checklistsDbId, apiKey);
          databasesStatus.checklists = {
            success: true,
            name: checklistsDb.title?.[0]?.plain_text || checklistsDbId,
            error: ''
          };
          console.log('✅ Accès à la base de checklists réussi:', databasesStatus.checklists.name);
          
          // Vérifier les propriétés essentielles pour les checklists
          const missingProps = this.checkRequiredProperties(
            checklistsDb.properties,
            ['Name', 'Description', 'Category']
          );
          
          if (missingProps.length > 0) {
            console.warn('⚠️ Propriétés manquantes dans la base de checklists:', missingProps);
            databasesStatus.checklists.error = `Propriétés manquantes: ${missingProps.join(', ')}`;
          }
        } catch (error) {
          console.error('❌ Échec d\'accès à la base de checklists:', error);
          databasesStatus.checklists = {
            success: false,
            name: '',
            error: error.message || 'Erreur d\'accès à la base de checklists'
          };
        }
      }
      
      // Vérifier si on peut récupérer des projets
      let projectsData = { count: 0, error: '' };
      try {
        const projects = await notionApi.databases.query(projectsDbId, {}, apiKey);
        projectsData.count = projects.results.length;
        console.log(`✅ ${projectsData.count} projets trouvés dans la base`);
      } catch (error) {
        console.error('❌ Échec de récupération des projets:', error);
        projectsData.error = error.message || 'Erreur de requête sur la base de projets';
      }
      
      // Restaurer le mode mock si nécessaire
      if (wasMockEnabled) {
        notionApi.mockMode.activate();
        console.log('🔍 Diagnostic: Mode mock restauré à son état initial');
      }
      
      // Déterminer le succès global
      const isSuccessful = databasesStatus.projects.success && 
                          (!checklistsDbId || databasesStatus.checklists.success) &&
                          !projectsData.error;
      
      return {
        success: isSuccessful,
        message: isSuccessful ? 'Diagnostic Notion réussi' : 'Problèmes détectés avec Notion',
        details: {
          user: user.name,
          databases: databasesStatus,
          projects: projectsData
        }
      };
    } catch (error) {
      console.error('❌ Échec du diagnostic Notion:', error);
      
      // Restaurer le mode mock si nécessaire
      if (wasMockEnabled) {
        notionApi.mockMode.activate();
        console.log('🔍 Diagnostic: Mode mock restauré après erreur');
      }
      
      return {
        success: false,
        message: 'Erreur lors du diagnostic Notion',
        details: {
          error: error.message || 'Erreur inconnue'
        }
      };
    }
  },
  
  /**
   * Vérifie si des propriétés requises sont présentes dans un objet properties de Notion
   */
  checkRequiredProperties(properties: Record<string, any>, requiredProps: string[]): string[] {
    if (!properties) return requiredProps;
    
    const allPropKeys = Object.keys(properties);
    const missingProps: string[] = [];
    
    for (const prop of requiredProps) {
      // Chercher la propriété en ignorant la casse
      const found = allPropKeys.some(key => 
        key.toLowerCase() === prop.toLowerCase() ||
        key.toLowerCase() === prop.toLowerCase() + 's'
      );
      
      if (!found) {
        missingProps.push(prop);
      }
    }
    
    return missingProps;
  },
  
  /**
   * Tente de réparer les problèmes de configuration Notion
   */
  async fixNotionIssues(): Promise<boolean> {
    try {
      // Forcer la désactivation du mode mock
      notionApi.mockMode.forceReset();
      localStorage.removeItem('notion_mock_mode');
      localStorage.removeItem('notion_last_error');
      
      // Vérifier que la connexion est maintenant possible
      const result = await this.runFullDiagnostic();
      
      if (result.success) {
        toast.success('Problèmes Notion résolus', {
          description: 'La connexion fonctionne maintenant correctement'
        });
        return true;
      } else {
        // Si échec, proposer d'activer le mode mock explicitement
        toast.error('Problèmes persistants avec Notion', {
          description: result.message,
          action: {
            label: 'Utiliser Mode Démo',
            onClick: () => {
              notionApi.mockMode.activate();
              toast.info('Mode démonstration activé', {
                description: 'L\'application utilise maintenant des données fictives'
              });
              // Forcer un rechargement de la page
              setTimeout(() => window.location.reload(), 1500);
            }
          }
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Échec de réparation des problèmes Notion:', error);
      toast.error('Échec de réparation', {
        description: error.message || 'Une erreur est survenue lors de la réparation'
      });
      return false;
    }
  }
};
