
/**
 * Utilitaires pour le service Notion
 */

// Fonction pour extraire l'ID d'une URL Notion
export function extractNotionDatabaseId(url: string): string {
  // Si l'entrée est vide, retourner une chaîne vide
  if (!url) return '';
  
  // Si c'est déjà juste l'ID, vérifier qu'il a un format valide et le retourner
  if (url.match(/^[a-zA-Z0-9]{32}$/)) {
    return url;
  }
  
  try {
    // Tenter d'extraire l'ID à partir d'une URL Notion
    if (url.includes('notion.so')) {
      // Format: https://www.notion.so/workspace/83d9d3a270ff4b0a95856a96db5a7e35?v=...
      // ou: https://www.notion.so/83d9d3a270ff4b0a95856a96db5a7e35?v=...
      const match = url.match(/([a-zA-Z0-9]{32})/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Deuxième tentative avec un autre format d'URL
    const secondMatch = url.match(/([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})/);
    if (secondMatch && secondMatch[1]) {
      // Convertir le format UUID en format sans tirets
      return secondMatch[1].replace(/-/g, '');
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction de l\'ID de la base de données:', error);
  }
  
  // Si on ne peut pas extraire l'ID, retourner l'entrée telle quelle
  return url;
}

// Fonction pour valider un ID de base de données Notion
export function isValidNotionDatabaseId(id: string): boolean {
  return /^[a-zA-Z0-9]{32}$/.test(id);
}

// Fonction pour valider une clé API Notion
export function isValidNotionApiKey(key: string): boolean {
  // Clé d'intégration ou token OAuth
  return /^(secret_[a-zA-Z0-9]{43}|ntn_[a-zA-Z0-9]{43})$/.test(key);
}

// Utilitaires pour extraire les valeurs des propriétés Notion
export const notionPropertyExtractors = {
  getRichTextValue: (property: any): string => {
    if (!property || property.type !== 'rich_text') return '';
    
    if (Array.isArray(property.rich_text) && property.rich_text.length > 0) {
      return property.rich_text.map((rt: any) => rt.plain_text).join('');
    }
    
    return '';
  },
  
  getNumberValue: (property: any): number => {
    if (!property || property.type !== 'number') return 0;
    return property.number || 0;
  },
  
  getDateValue: (property: any): string | null => {
    if (!property || property.type !== 'date' || !property.date) return null;
    return property.date.start || null;
  },
  
  getSelectValue: (property: any): string => {
    if (!property || property.type !== 'select' || !property.select) return '';
    return property.select.name || '';
  }
};

// Formats et utilitaires d'aide pour créer des propriétés Notion
export const notionPropertyFormatters = {
  createTitle: (text: string) => ({
    title: [
      {
        type: 'text',
        text: { content: text }
      }
    ]
  }),
  
  createRichText: (text: string) => ({
    rich_text: [
      {
        type: 'text',
        text: { content: text }
      }
    ]
  }),
  
  createSelect: (name: string) => ({
    select: { name }
  }),
  
  createMultiSelect: (names: string[]) => ({
    multi_select: names.map(name => ({ name }))
  }),
  
  createDate: (date: string | Date) => ({
    date: {
      start: typeof date === 'string' ? date : date.toISOString().split('T')[0]
    }
  }),
  
  createNumber: (value: number) => ({
    number: value
  }),
  
  createCheckbox: (checked: boolean) => ({
    checkbox: checked
  }),
  
  createUrl: (url: string) => ({
    url
  })
};

// Fonction pour générer une structure standardisée pour les bases de données
export function generateStandardDatabaseSchema(title: string, description?: string) {
  return {
    title: [
      {
        type: 'text',
        text: {
          content: title
        }
      }
    ],
    properties: {
      Name: {
        title: {}
      },
      Description: {
        rich_text: {}
      },
      Status: {
        select: {
          options: [
            { name: 'Active', color: 'green' },
            { name: 'Archived', color: 'gray' },
            { name: 'Draft', color: 'blue' }
          ]
        }
      },
      CreatedAt: {
        date: {}
      }
    },
    ...(description ? {
      description: [
        {
          type: 'text',
          text: {
            content: description
          }
        }
      ]
    } : {})
  };
}
