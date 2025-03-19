
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
  
  // Vérifier l'état du mode mock
  const isMockMode = mockMode.isActive();
  console.log(`⚠️ État du mode mock lors de la création: ${isMockMode ? 'ACTIF' : 'INACTIF'}`);
  
  // Désactiver le mode mock pendant la création
  if (isMockMode) {
    mockMode.temporarilyForceReal();
    console.log('✅ Mode réel temporairement forcé pour la création du projet');
  }
  
  // Format du token : vérifier et ajouter "Bearer " si nécessaire
  let formattedToken = token;
  if (!token.startsWith('Bearer ')) {
    if (token.startsWith('secret_') || token.startsWith('ntn_')) {
      formattedToken = `Bearer ${token}`;
      console.log('Token formaté avec préfixe Bearer pour API Notion');
    }
  }
  
  // Nettoyer et standardiser les propriétés pour éviter les erreurs d'API
  if (data && data.properties) {
    // S'assurer que les propriétés standard avec noms capitalisés sont présentes
    if (!data.properties.Name && data.properties.name) {
      data.properties.Name = { ...data.properties.name };
      delete data.properties.name; // Supprimer la version non capitalisée
    }
    
    if (!data.properties.URL && data.properties.url) {
      data.properties.URL = { ...data.properties.url };
      delete data.properties.url; // Supprimer la version non capitalisée
    }
    
    // S'assurer que les propriétés de titre sont correctement formatées
    if (data.properties.Name && data.properties.Name.title) {
      if (Array.isArray(data.properties.Name.title)) {
        data.properties.Name.title = data.properties.Name.title.map((item: any) => {
          if (typeof item === 'string') {
            return { text: { content: item } };
          }
          if (typeof item.text === 'string') {
            return { text: { content: item.text } };
          }
          return item;
        });
      } else if (typeof data.properties.Name.title === 'string') {
        // Convertir une chaîne simple en format attendu par l'API
        data.properties.Name.title = [{ text: { content: data.properties.Name.title } }];
      }
    }
    
    // Nettoyer les propriétés en double qui pourraient causer des problèmes
    // Conserver uniquement les propriétés utilisées dans la base de données
    const cleanedProperties: Record<string, any> = {};
    Object.entries(data.properties).forEach(([key, value]) => {
      // Ne pas dépasser 100 propriétés (limite de l'API Notion)
      if (Object.keys(cleanedProperties).length < 90) {
        cleanedProperties[key] = value;
      }
    });
    
    data.properties = cleanedProperties;
  }
  
  // Log des données nettoyées
  console.log('📝 Données nettoyées pour création de page:', JSON.stringify(data, null, 2));
  
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
          description: 'Le format des données envoyées n\'est pas accepté par Notion. Vérifiez les propriétés requises de votre base de données.'
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
  }
};
