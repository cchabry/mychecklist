
import { notionApiRequest } from '../proxyFetch';
import { toast } from 'sonner';
import { mockMode } from '../mockMode';

/**
 * Récupère une page par son ID
 */
export const retrieve = async (pageId: string, token: string) => {
  return notionApiRequest(`/pages/${pageId}`, 'GET', undefined, token);
};

/**
 * Crée une nouvelle page
 */
export const create = async (data: any, token: string) => {
  console.log('🚀 Création de page Notion via proxy:', JSON.stringify(data, null, 2));
  
  // Vérifier si le token est présent
  if (!token) {
    console.error('❌ Erreur: Token manquant pour la création de page Notion');
    toast.error('Token Notion manquant', {
      description: 'Veuillez configurer correctement votre clé API Notion.'
    });
    return Promise.reject(new Error('Token Notion manquant'));
  }
  
  // Vérifier l'état du mode mock de façon plus approfondie
  const forceRealMode = localStorage.getItem('notion_force_real') === 'true';
  const isMockMode = mockMode.isActive();
  console.log(`⚠️ État du mode mock lors de la création:`, {
    'mockMode.isActive()': isMockMode,
    'forceRealMode': forceRealMode,
    'localStorage.notion_mock_mode': localStorage.getItem('notion_mock_mode'),
    'localStorage.notion_force_real': localStorage.getItem('notion_force_real'),
    'temporarilyForcedReal': mockMode.isTemporarilyForcedReal ? mockMode.isTemporarilyForcedReal() : 'non disponible'
  });
  
  // Désactiver le mode mock pendant la création
  if (isMockMode || forceRealMode) {
    console.log('✅ Mode réel temporairement forcé pour la création du projet');
    // Désactiver de façon plus agressive
    localStorage.removeItem('notion_mock_mode');
    localStorage.setItem('notion_force_real', 'true');
    mockMode.temporarilyForceReal();
  }
  
  // Vérifier à nouveau si le mode est bien désactivé
  if (mockMode.isActive()) {
    console.warn('⚠️ ALERTE: Mode mock toujours actif malgré la tentative de désactivation!');
  } else {
    console.log('✅ Confirmation: Mode réel activé pour la création.');
  }
  
  // Format du token : vérifier et ajouter "Bearer " si nécessaire
  let formattedToken = token;
  if (!token.startsWith('Bearer ')) {
    if (token.startsWith('secret_') || token.startsWith('ntn_')) {
      formattedToken = `Bearer ${token}`;
      console.log('Token formaté avec préfixe Bearer pour API Notion');
    }
  }
  
  // NOUVEAU: Vérifier d'abord la structure de la base de données pour adapter le format des données
  try {
    // Si nous avons un parent database_id, vérifions sa structure avant création
    if (data?.parent?.database_id) {
      console.log('🔍 Vérification de la structure de la base de données avant création...');
      
      try {
        const dbDetails = await notionApiRequest(
          `/databases/${data.parent.database_id}`, 
          'GET', 
          undefined, 
          formattedToken
        );
        
        // Si on obtient la structure, mettons à jour nos propriétés pour qu'elles correspondent
        if (dbDetails && dbDetails.properties) {
          console.log('✅ Structure de la base de données récupérée:', 
            Object.keys(dbDetails.properties).map(key => `${key} (${dbDetails.properties[key].type})`)
          );
          
          // Créons un nouvel objet properties adapté à la base
          const adaptedProperties: Record<string, any> = {};
          
          // Parcourir les propriétés de la base de données et adapter nos données
          Object.entries(dbDetails.properties).forEach(([propName, propDetails]) => {
            const propType = (propDetails as any).type;
            
            // Gérer la propriété de titre spéciale (normalement Name)
            if (propType === 'title') {
              console.log(`🔄 Adaptation de la propriété titre "${propName}" (${propType})`);
              
              // Si nous avons déjà une propriété Name, l'utiliser
              if (data.properties.Name && data.properties.Name.title) {
                adaptedProperties[propName] = {
                  title: data.properties.Name.title
                };
              } 
              // Sinon essayer "name", "Titre", "titre", etc.
              else if (data.properties.name && data.properties.name.title) {
                adaptedProperties[propName] = {
                  title: data.properties.name.title
                };
              }
              // Si aucune ne correspond, créer une valeur par défaut
              else {
                adaptedProperties[propName] = {
                  title: [{ text: { content: "Nouveau projet" } }]
                };
              }
            }
            // Gérer les propriétés select (comme Status)
            else if (propType === 'select') {
              console.log(`🔄 Adaptation de la propriété select "${propName}" (${propType})`);
              
              // Si la propriété s'appelle Status, Statut ou status, essayer de l'adapter
              const isStatusField = propName.toLowerCase() === 'status' || 
                                   propName.toLowerCase() === 'statut';
              
              if (isStatusField) {
                // Vérifier si nous avons des options valides pour ce select
                if ((propDetails as any).select?.options?.length > 0) {
                  // Utiliser la première option disponible comme valeur par défaut
                  const defaultOption = (propDetails as any).select.options[0].name;
                  adaptedProperties[propName] = {
                    select: { name: defaultOption }
                  };
                  console.log(`✅ Utilisation de la valeur par défaut "${defaultOption}" pour ${propName}`);
                } else {
                  console.log(`⚠️ Aucune option trouvée pour le select ${propName}, champ ignoré`);
                }
              }
            }
            // Gérer les propriétés rich_text (comme Description)
            else if (propType === 'rich_text') {
              console.log(`🔄 Adaptation de la propriété rich_text "${propName}" (${propType})`);
              
              if (propName.toLowerCase().includes('description')) {
                adaptedProperties[propName] = {
                  rich_text: [{ text: { content: "Description du projet" } }]
                };
              }
            }
            // Gérer les propriétés URL
            else if (propType === 'url') {
              console.log(`🔄 Adaptation de la propriété url "${propName}" (${propType})`);
              
              adaptedProperties[propName] = {
                url: "https://example.com"
              };
            }
            // Gérer les propriétés number (comme progress)
            else if (propType === 'number') {
              if (propName.toLowerCase().includes('progress')) {
                adaptedProperties[propName] = {
                  number: 0
                };
              }
            }
            // Gérer les propriétés date
            else if (propType === 'date') {
              adaptedProperties[propName] = {
                date: { start: new Date().toISOString() }
              };
            }
            // Ignorer les autres types de propriétés pour la création
          });
          
          console.log('📝 Propriétés adaptées à la structure de la base:', JSON.stringify(adaptedProperties, null, 2));
          
          // Remplacer les propriétés d'origine par celles adaptées
          data.properties = adaptedProperties;
        }
      } catch (dbError) {
        console.error('❌ Erreur lors de la vérification de la structure de la base:', dbError);
        // On continue quand même, car l'erreur pourrait venir d'autre chose
        // mais on ajoute un log plus détaillé pour aider au debug
        if (dbError.message?.includes('400')) {
          console.error('❌ Erreur 400 - Mauvaise requête. Vérifiez l\'ID de la base de données.');
        } else if (dbError.message?.includes('404')) {
          console.error('❌ Erreur 404 - Base de données introuvable. Vérifiez l\'ID et les permissions.');
        } else if (dbError.message?.includes('403')) {
          console.error('❌ Erreur 403 - Accès refusé. Votre intégration n\'a pas accès à cette base de données.');
        }
      }
    }
  } catch (structureError) {
    console.error('❌ Erreur lors de l\'adaptation des données à la structure:', structureError);
    // On continue avec les données d'origine
  }
  
  // Log des données nettoyées et adaptées à la base
  console.log('📝 Données finales pour création de page:', JSON.stringify(data, null, 2));
  
  // Effacer le cache avant création
  localStorage.removeItem('projects_cache');
  console.log('🧹 Cache des projets effacé');
  
  // Appel de l'API Notion
  try {
    console.log('📡 Envoi de la requête à l\'API Notion avec token:', formattedToken.substring(0, 15) + '...');
    console.log('📡 Endpoint: /pages');
    console.log('📡 Méthode: POST');
    console.log('📡 Données: ', JSON.stringify(data, null, 2));
    
    const response = await notionApiRequest('/pages', 'POST', data, formattedToken);
    console.log('✅ Réponse de création de page:', JSON.stringify(response, null, 2));
    
    // Si la création a réussi, nettoyer les caches
    if (response && response.id) {
      console.log('🎉 Création réussie! ID de la page:', response.id);
      
      // Effacer le cache des projets pour forcer un rechargement
      localStorage.removeItem('projects_cache');
      localStorage.removeItem('cache_invalidated_at');
      
      // Ajouter un délai de cache pour éviter de charger avant que Notion n'ait indexé
      localStorage.setItem('cache_invalidated_at', Date.now().toString());
      
      // Notification de succès
      toast.success('Projet créé avec succès', {
        description: 'Le projet a été ajouté à votre base de données Notion.'
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la création de page Notion:', error);
    
    // Tentative de récupération plus détaillée des informations d'erreur
    let errorDetails = '';
    if (error.response) {
      try {
        errorDetails = JSON.stringify(error.response);
      } catch (e) {
        errorDetails = 'Impossible de sérialiser les détails de la réponse';
      }
    }
    console.error('❌ Détails supplémentaires:', errorDetails);
    
    // Afficher une notification d'erreur avec plus de détails
    let errorMessage = 'Une erreur est survenue lors de la création du projet.';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Analyse plus détaillée des erreurs courantes
      if (errorMessage.includes('401')) {
        errorMessage = 'Authentification Notion échouée. Vérifiez votre clé API.';
        toast.error('Erreur d\'authentification', {
          description: 'Votre clé API Notion semble invalide ou expirée. Veuillez la vérifier et la mettre à jour.',
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
      } else if (errorMessage.includes('400')) {
        errorMessage = 'Format de données invalide pour Notion.';
        toast.error('Erreur de format', {
          description: 'Le format des données envoyées n\'est pas accepté par Notion. Vérifiez les propriétés requises de votre base de données.',
          action: {
            label: 'Vérifier structure',
            onClick: () => {
              // Sauvegarder l'erreur dans localStorage pour pouvoir l'analyser
              localStorage.setItem('notion_last_error', JSON.stringify(error.message || 'Erreur 400'));
              toast.info('Conseil', {
                description: 'Vérifiez que votre base Notion contient les propriétés correctes et que leurs types correspondent.'
              });
            }
          }
        });
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Base de données Notion introuvable.';
        toast.error('Base introuvable', {
          description: 'L\'ID de la base de données Notion est incorrect ou cette base n\'existe plus.',
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
      } else if (errorMessage.includes('CORS') || errorMessage.includes('network')) {
        errorMessage = 'Problème de connexion au serveur Notion (CORS/réseau).';
        toast.error('Erreur réseau', {
          description: 'Impossible d\'accéder à l\'API Notion directement. Le proxy serverless sera utilisé.',
        });
      } else {
        // Erreur générique avec plus de détails
        toast.error('Échec de création du projet', {
          description: `${errorMessage}. Vérifiez la console pour plus de détails.`
        });
      }
    }
    
    // Activer le mode mock en cas d'erreur persistante
    mockMode.activate();
    console.log('⚠️ Mode mock activé suite à une erreur');
    
    throw error;
  } finally {
    // Restaurer le mode mock si nécessaire
    if (isMockMode) {
      mockMode.restoreAfterForceReal();
      console.log('⚠️ État du mode mock restauré à son état initial');
    }
  }
};

/**
 * Met à jour une page existante
 */
export const update = async (pageId: string, properties: any, token: string) => {
  // Vérifier que le pageId et le token sont présents
  if (!pageId) {
    console.error('ID de page manquant pour la mise à jour');
    return Promise.reject(new Error('ID de page manquant'));
  }
  
  if (!token) {
    console.error('Token manquant pour la mise à jour de page');
    return Promise.reject(new Error('Token Notion manquant'));
  }
  
  console.log(`Mise à jour de la page ${pageId}:`, JSON.stringify(properties, null, 2));
  
  // Désactiver temporairement le mode mock pour cette opération
  const isMockMode = mockMode.isActive();
  if (isMockMode) {
    console.log('✅ Mode réel temporairement forcé pour la mise à jour de page');
    mockMode.temporarilyForceReal();
  }
  
  try {
    const response = await notionApiRequest(
      `/pages/${pageId}`, 
      'PATCH', 
      properties,
      token
    );
    
    // Si la mise à jour réussit, invalider le cache
    if (response && response.id) {
      if (typeof localStorage !== 'undefined') {
        // Effacer les caches spécifiques si nécessaire
        localStorage.removeItem('projects_cache');
        localStorage.removeItem(`project_${pageId}_cache`);
      }
    }
    
    return response;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la page ${pageId}:`, error);
    throw error;
  } finally {
    // Restaurer le mode mock si nécessaire
    if (isMockMode) {
      mockMode.restoreAfterForceReal();
    }
  }
};
