import { Client } from '@notionhq/client';
import { toast } from 'sonner';
import { notionApi } from '../notionProxy';

// Singleton Notion client instance
let notionClient: Client | null = null;
let databaseId: string | null = null;

/**
 * Extracts the clean database ID from various formats
 */
export const extractNotionDatabaseId = (id: string): string => {
  // If the ID contains a hyphen, extract the part after the hyphen
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
    
    // Note: We're still initializing the regular Notion client for compatibility,
    // but all requests will go through our proxy
    notionClient = new Client({ 
      auth: apiKey
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
 * Test Notion API connection - USING PROXY now
 */
export const testNotionConnection = async (client: Client): Promise<boolean> => {
  try {
    console.log('Testing Notion API connection via proxy...');
    
    // Get API Key from localStorage (same as in the client)
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      console.error('No API key found');
      return false;
    }
    
    // Use our proxy instead of direct Notion client
    const userResponse = await notionApi.users.me(apiKey);
    console.log('Notion API connection successful via proxy, user:', userResponse.name);
    
    // Check database access
    const { dbId } = getNotionClient();
    
    if (dbId) {
      try {
        console.log('Testing database access with ID:', dbId);
        await notionApi.databases.retrieve(dbId, apiKey);
        console.log('Database access successful via proxy');
      } catch (dbError) {
        console.error('Database access failed:', dbError);
        toast.error('Erreur d\'accès à la base de données', {
          description: 'Vérifiez l\'ID de base de données et les permissions de l\'intégration'
        });
        return false;
      }
    }
    
    return true;
  } catch (testError) {
    console.error('Notion API connection test failed:', testError);
    
    // Show appropriate message based on the error
    if (testError.message?.includes('401')) {
      toast.error('Clé API Notion invalide', {
        description: 'Vérifiez votre clé d\'intégration Notion'
      });
    } else if (testError.message?.includes('Failed to fetch')) {
      toast.error('Erreur de connexion au proxy Notion', {
        description: 'Vérifiez que le proxy est correctement déployé sur Vercel'
      });
      
      // Activate mock mode automatically when proxy fails
      notionApi.mockMode.activate();
      toast.info('Mode démo activé', {
        description: 'L\'application fonctionne avec des données de test'
      });
    } else {
      toast.error('Erreur de connexion à Notion API', {
        description: 'Vérifiez votre connexion internet et vos paramètres Notion'
      });
    }
    
    return false;
  }
};
