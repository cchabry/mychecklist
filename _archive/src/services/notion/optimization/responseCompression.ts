
/**
 * Utilitaires pour la compression et l'optimisation des réponses
 */

/**
 * Compresse une réponse Notion pour en réduire la taille
 * 
 * Optimise la structure des données en supprimant les champs inutiles
 * et en compactant les structures redondantes
 */
export const notionResponseCompressor = {
  /**
   * Compresse une réponse d'API Notion
   */
  compressResponse<T>(response: T): T {
    // Si null ou undefined, retourner tel quel
    if (response == null) {
      return response;
    }
    
    // Si c'est un tableau, compresser chaque élément
    if (Array.isArray(response)) {
      return response.map(item => this.compressResponse(item)) as unknown as T;
    }
    
    // Si ce n'est pas un objet, retourner tel quel
    if (typeof response !== 'object') {
      return response;
    }
    
    // Pour les objets, compresser en fonction du type
    const obj = response as Record<string, any>;
    
    // Détecter si c'est une réponse de liste Notion
    if ('results' in obj && Array.isArray(obj.results)) {
      return this.compressListResponse(obj) as unknown as T;
    }
    
    // Détecter si c'est une page Notion
    if ('id' in obj && 'properties' in obj) {
      return this.compressPageResponse(obj) as unknown as T;
    }
    
    // Détecter si c'est une base de données Notion
    if ('id' in obj && 'title' in obj) {
      return this.compressDatabaseResponse(obj) as unknown as T;
    }
    
    // Pour les autres objets, appliquer la compression récursivement
    const result: Record<string, any> = {};
    
    for (const key in obj) {
      // Ignorer les propriétés prototypes
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      
      // Ignorer certaines métadonnées qui ne sont pas utilisées par l'application
      if (['object', 'created_by', 'last_edited_by', 'url', 'public_url'].includes(key)) {
        continue;
      }
      
      // Compression récursive
      result[key] = this.compressResponse(obj[key]);
    }
    
    return result as unknown as T;
  },
  
  /**
   * Compresse une réponse de liste Notion
   */
  compressListResponse(response: Record<string, any>): Record<string, any> {
    // Compresser chaque résultat
    const compressedResults = response.results.map((item: any) => this.compressResponse(item));
    
    // Retourner uniquement les champs nécessaires
    return {
      results: compressedResults,
      next_cursor: response.next_cursor,
      has_more: response.has_more
    };
  },
  
  /**
   * Compresse une réponse de page Notion
   */
  compressPageResponse(page: Record<string, any>): Record<string, any> {
    // Compresser les propriétés
    const compressedProperties: Record<string, any> = {};
    
    if (page.properties) {
      for (const key in page.properties) {
        if (!Object.prototype.hasOwnProperty.call(page.properties, key)) continue;
        
        // Optimiser chaque propriété selon son type
        compressedProperties[key] = this.compressProperty(page.properties[key]);
      }
    }
    
    // Réduire au minimum nécessaire
    return {
      id: page.id,
      properties: compressedProperties,
      // Conserver les données parent si présentes (utile pour la navigation)
      parent: page.parent ? { type: page.parent.type, id: page.parent.id } : undefined,
      // Inclure seulement si présents et utiles
      icon: page.icon,
      cover: page.cover,
      // Dates simplifiées
      created_time: page.created_time,
      last_edited_time: page.last_edited_time
    };
  },
  
  /**
   * Compresse une réponse de base de données Notion
   */
  compressDatabaseResponse(database: Record<string, any>): Record<string, any> {
    // Optimiser les propriétés de la base
    const compressedProperties: Record<string, any> = {};
    
    if (database.properties) {
      for (const key in database.properties) {
        if (!Object.prototype.hasOwnProperty.call(database.properties, key)) continue;
        
        // Conserver uniquement le type et la configuration
        const property = database.properties[key];
        compressedProperties[key] = { 
          type: property.type,
          [property.type]: property[property.type]
        };
      }
    }
    
    // Retourner la structure minimale
    return {
      id: database.id,
      title: database.title,
      properties: compressedProperties,
      // Récupérer d'autres champs utiles si présents
      parent: database.parent ? { type: database.parent.type, id: database.parent.id } : undefined
    };
  },
  
  /**
   * Compresse une propriété Notion selon son type
   */
  compressProperty(property: Record<string, any>): Record<string, any> {
    // Si pas de type défini, retourner tel quel
    if (!property.type) {
      return property;
    }
    
    // Structure de base
    const compressed: Record<string, any> = {
      type: property.type
    };
    
    // Compresser selon le type
    switch (property.type) {
      case 'title':
      case 'rich_text':
        // Extraire uniquement le texte brut si possible
        if (property[property.type] && Array.isArray(property[property.type])) {
          if (property[property.type].length === 0) {
            compressed[property.type] = [];
          } else if (property[property.type].length === 1) {
            // Optimisation pour les textes simples
            const textItem = property[property.type][0];
            compressed[property.type] = [{
              plain_text: textItem.plain_text,
              href: textItem.href
            }];
          } else {
            // Pour les textes complexes, conserver la structure
            compressed[property.type] = property[property.type].map((item: any) => ({
              plain_text: item.plain_text,
              href: item.href
            }));
          }
        } else {
          compressed[property.type] = property[property.type];
        }
        break;
        
      case 'select':
      case 'status':
        // Pour les sélections, garder uniquement le nom et la couleur
        if (property[property.type]) {
          compressed[property.type] = {
            name: property[property.type].name,
            color: property[property.type].color
          };
        } else {
          compressed[property.type] = null;
        }
        break;
        
      case 'multi_select':
        // Pour les multi-sélections, simplifier chaque option
        if (property[property.type] && Array.isArray(property[property.type])) {
          compressed[property.type] = property[property.type].map((item: any) => ({
            name: item.name,
            color: item.color
          }));
        } else {
          compressed[property.type] = [];
        }
        break;
        
      case 'date':
        // Conserver uniquement les dates
        if (property[property.type]) {
          compressed[property.type] = {
            start: property[property.type].start,
            end: property[property.type].end
          };
        } else {
          compressed[property.type] = null;
        }
        break;
        
      case 'people':
        // Pour les personnes, garder ID et nom
        if (property[property.type] && Array.isArray(property[property.type])) {
          compressed[property.type] = property[property.type].map((item: any) => ({
            id: item.id,
            name: item.name
          }));
        } else {
          compressed[property.type] = [];
        }
        break;
        
      case 'files':
        // Pour les fichiers, garder URL et nom
        if (property[property.type] && Array.isArray(property[property.type])) {
          compressed[property.type] = property[property.type].map((item: any) => ({
            name: item.name,
            type: item.type,
            [item.type]: item[item.type]
          }));
        } else {
          compressed[property.type] = [];
        }
        break;
        
      case 'relation':
        // Pour les relations, garder uniquement les IDs
        if (property[property.type] && Array.isArray(property[property.type])) {
          compressed[property.type] = property[property.type].map((item: any) => ({
            id: item.id
          }));
        } else {
          compressed[property.type] = [];
        }
        break;
        
      default:
        // Pour les autres types, conserver la propriété telle quelle
        compressed[property.type] = property[property.type];
    }
    
    return compressed;
  }
};
