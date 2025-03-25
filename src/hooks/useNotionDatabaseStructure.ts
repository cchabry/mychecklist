
import { useState, useCallback } from 'react';
import { useNotionRequest } from './useNotionRequest';
import { useNotion } from '@/contexts/NotionContext';
import { notionApi } from '@/lib/notionProxy';

export type PropertyCheck = {
  name: string;
  type: string;
  required: boolean;
  found: boolean;
  foundType?: string;
  valid: boolean;
};

export type DatabaseStructureCheck = {
  id: string;
  name: string;
  isLoading: boolean;
  error: string | null;
  properties: PropertyCheck[];
  isValid: boolean;
  hasAllRequired: boolean;
};

// Interface pour la structure de la réponse de l'API Notion pour une base de données
interface NotionDatabaseResponse {
  id: string;
  title?: Array<{
    type: string;
    plain_text?: string;
    [key: string]: any;
  }>;
  properties?: Record<string, {
    type: string;
    name?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export function useNotionDatabaseStructure() {
  const notionRequest = useNotionRequest();
  const { config } = useNotion();
  const [structureChecks, setStructureChecks] = useState<Record<string, DatabaseStructureCheck>>({});
  
  // Vérifier la structure d'une base de données
  const checkDatabaseStructure = useCallback(async (
    databaseId: string,
    requiredProperties: Array<{name: string, type: string, required: boolean}>,
    options: { onComplete?: (result: DatabaseStructureCheck) => void } = {}
  ) => {
    if (!databaseId) return null;
    
    // Initialiser l'état pour cette base de données
    setStructureChecks(prev => ({
      ...prev,
      [databaseId]: {
        id: databaseId,
        name: databaseId,
        isLoading: true,
        error: null,
        properties: [],
        isValid: false,
        hasAllRequired: false
      }
    }));
    
    try {
      // Récupérer les informations de la base de données
      const dbInfo = await notionRequest.execute(`/databases/${databaseId}`, 'GET', undefined, config.apiKey) as NotionDatabaseResponse;
      
      if (!dbInfo) {
        throw new Error("Échec de récupération des informations de base de données");
      }
      
      // Mapper les propriétés requises avec celles trouvées
      const propertiesCheck = requiredProperties.map(required => {
        const foundProperty = dbInfo.properties ? Object.entries(dbInfo.properties).find(
          ([key, prop]) => key.toLowerCase() === required.name.toLowerCase()
        ) : null;
        
        return {
          name: required.name,
          type: required.type,
          required: required.required,
          found: !!foundProperty,
          foundType: foundProperty ? (foundProperty[1] as any).type : undefined,
          valid: foundProperty ? (foundProperty[1] as any).type === required.type : false
        };
      });
      
      // Vérifier si toutes les propriétés requises sont présentes et valides
      const hasAllRequired = propertiesCheck
        .filter(prop => prop.required)
        .every(prop => prop.found && prop.valid);
      
      // Vérifier si toutes les propriétés trouvées sont valides
      const isValid = propertiesCheck
        .filter(prop => prop.found)
        .every(prop => prop.valid);
      
      // Construire le résultat
      const structureCheck: DatabaseStructureCheck = {
        id: databaseId,
        name: dbInfo.title && dbInfo.title[0] && dbInfo.title[0].plain_text ? dbInfo.title[0].plain_text : databaseId,
        isLoading: false,
        error: null,
        properties: propertiesCheck,
        isValid,
        hasAllRequired
      };
      
      // Mettre à jour l'état
      setStructureChecks(prev => ({
        ...prev,
        [databaseId]: structureCheck
      }));
      
      if (options.onComplete) {
        options.onComplete(structureCheck);
      }
      
      return structureCheck;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setStructureChecks(prev => ({
        ...prev,
        [databaseId]: {
          ...prev[databaseId],
          isLoading: false,
          error: errorMessage,
          properties: [],
          isValid: false,
          hasAllRequired: false
        }
      }));
      
      return null;
    }
  }, [notionRequest, config.apiKey]);
  
  return {
    structureChecks,
    checkDatabaseStructure
  };
}
