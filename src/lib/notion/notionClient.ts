
import { Client } from '@notionhq/client';
import { toast } from 'sonner';

// Singleton Notion client instance
let notionClient: Client | null = null;
let databaseId: string | null = null;

/**
 * Extracts the clean database ID from various formats
 */
export const extractNotionDatabaseId = (id: string): string => {
  // If the ID contains a tiret, extract the part after the tiret
  if (id.includes('-')) {
    return id.split('-').pop() || id;
  }
  
  // If the ID contains a slash (URL), extract the last part
  if (id.includes('/')) {
    return id.split('/').pop() || id;
  }
  
  // Remove anything that is not alphanumeric or a dash
  return id.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Checks if Notion is configured in localStorage
 */
export const isNotionConfigured = (): boolean => {
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  return !!apiKey && !!dbId;
};

/**
 * Configures the Notion client with the provided API key and database ID
 */
export const configureNotion = (apiKey: string, dbId: string): boolean => {
  try {
    // Clean the database ID
    const cleanDbId = extractNotionDatabaseId(dbId);
    console.log('Configuring Notion client with database ID:', cleanDbId, '(original:', dbId, ')');
    
    notionClient = new Client({ 
      auth: apiKey,
      // Add options to improve connectivity
      fetch: (url, options) => {
        console.log('Fetching Notion API:', url);
        return fetch(url, {
          ...options,
          // Add additional headers if needed
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          }
        });
      }
    });
    
    databaseId = cleanDbId;
    
    // Store in localStorage
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', cleanDbId);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration Notion:', error);
    return false;
  }
};

/**
 * Gets the Notion client, initializing it from localStorage if needed
 */
export const getNotionClient = (): { client: Client | null, dbId: string | null } => {
  if (!notionClient || !databaseId) {
    // If Notion is not configured, initialize with values from localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    if (!apiKey || !dbId) return { client: null, dbId: null };
    
    notionClient = new Client({ auth: apiKey });
    databaseId = dbId;
  }
  
  return { client: notionClient, dbId: databaseId };
};

/**
 * Helper utilities for extracting Notion property values
 */
export const notionPropertyExtractors = {
  getRichTextValue: (prop: any): string => {
    if (prop && prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
      return prop.rich_text[0].plain_text;
    }
    return '';
  },
  
  getTitleValue: (prop: any): string => {
    if (prop && prop.type === 'title' && prop.title && prop.title.length > 0) {
      return prop.title[0].plain_text;
    }
    return '';
  },
  
  getUrlValue: (prop: any): string => {
    if (prop && prop.type === 'url' && prop.url !== undefined) {
      return prop.url;
    }
    return '';
  },
  
  getNumberValue: (prop: any): number => {
    if (prop && prop.type === 'number' && prop.number !== undefined) {
      return prop.number;
    }
    return 0;
  },
  
  getDateValue: (prop: any): string | null => {
    if (prop && prop.type === 'date' && prop.date && prop.date.start) {
      return prop.date.start;
    }
    return null;
  }
};

/**
 * Test Notion API connection
 */
export const testNotionConnection = async (client: Client): Promise<boolean> => {
  try {
    const test = await client.users.me({});
    console.log('Notion API connection successful, user:', test.name);
    return true;
  } catch (testError) {
    console.error('Notion API connection test failed:', testError);
    toast.error('Erreur de connexion à Notion API', {
      description: 'Vérifiez votre clé API et votre connexion internet'
    });
    return false;
  }
};
