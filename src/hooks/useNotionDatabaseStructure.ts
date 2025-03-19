
import { useState, useCallback } from 'react';
import { useNotionApi } from './useNotionApi';
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

export function useNotionDatabaseStructure() {
  const { executeRequest } = useNotionApi();
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
    
    const result = await executeRequest(
      async () => {
        const dbInfo = await notionApi.databases.retrieve(databaseId, config.apiKey);
        
        // Mapper les propriétés requises avec celles trouvées
        const propertiesCheck = requiredProperties.map(required => {
          const foundProperty = Object.entries(dbInfo.properties || {}).find(
            ([key, prop]) => key.toLowerCase() === required.name.toLowerCase()
          );
          
          return {
            name: required.name,
            type: required.type,
            required: required.required,
            found: !!foundProperty,
            foundType: foundProperty ? (foundProperty[1] as any).type : undefined,
            valid: foundProperty ? (foundProperty[1] as any).type === required.type : false
          };
        });
        
        const hasAllRequired = propertiesCheck
          .filter(prop => prop.required)
          .every(prop => prop.found && prop.valid);
        
        const isValid = propertiesCheck
          .filter(prop => prop.found)
          .every(prop => prop.valid);
        
        // Construire le résultat
        const structureCheck: DatabaseStructureCheck = {
          id: databaseId,
          name: dbInfo.title?.[0]?.plain_text || databaseId,
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
      },
      {
        errorMessage: "Erreur lors de la vérification de la structure",
        onError: (error) => {
          setStructureChecks(prev => ({
            ...prev,
            [databaseId]: {
              ...prev[databaseId],
              isLoading: false,
              error: error.message,
              properties: [],
              isValid: false,
              hasAllRequired: false
            }
          }));
        }
      }
    );
    
    return result;
  }, [executeRequest, config.apiKey]);
  
  return {
    structureChecks,
    checkDatabaseStructure
  };
}
