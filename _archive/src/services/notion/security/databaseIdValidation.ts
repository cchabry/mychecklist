
import { structuredLogger } from '@/services/notion/logging/structuredLogger';

/**
 * Expression régulière pour valider un ID Notion
 * Format: 32 caractères hexadécimaux ou UUID avec tirets
 */
const NOTION_ID_REGEX = /^[a-zA-Z0-9]{32}$|^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/;

/**
 * Résultat de validation d'un ID
 */
export interface IdValidationResult {
  isValid: boolean;
  error?: string;
  normalizedId?: string;
}

/**
 * Extrait l'ID Notion d'une URL
 */
export function extractNotionIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Gérer les différents formats d'URL Notion
  
  // Format avec UUID: https://www.notion.so/workspace/83d9d3a2-70ff-4b0a-9585-6a96db5a7e35
  const uuidMatch = url.match(/([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})/);
  if (uuidMatch && uuidMatch[1]) {
    return uuidMatch[1].replace(/-/g, '');
  }
  
  // Format avec ID: https://www.notion.so/workspace/83d9d3a270ff4b0a95856a96db5a7e35
  const idMatch = url.match(/([a-zA-Z0-9]{32})/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  
  // Format avec ID court: https://www.notion.so/83d9d3a270ff4b0a95856a96db5a7e35
  const shortIdMatch = url.match(/notion\.so\/([a-zA-Z0-9]{32})/);
  if (shortIdMatch && shortIdMatch[1]) {
    return shortIdMatch[1];
  }
  
  return null;
}

/**
 * Normalise un ID Notion (supprime les tirets, extrait d'une URL, etc.)
 */
export function normalizeNotionId(input: string): string {
  if (!input) return '';
  
  // Si c'est une URL, tenter d'extraire l'ID
  if (input.includes('notion.so/')) {
    const extractedId = extractNotionIdFromUrl(input);
    if (extractedId) {
      return extractedId;
    }
  }
  
  // Si c'est un UUID avec tirets, les supprimer
  if (input.includes('-')) {
    return input.replace(/-/g, '');
  }
  
  // Sinon, retourner tel quel
  return input;
}

/**
 * Valide un ID Notion (format uniquement)
 */
export function validateNotionId(input: string): IdValidationResult {
  if (!input) {
    return {
      isValid: false,
      error: 'ID manquant'
    };
  }
  
  // Normaliser l'ID
  const normalizedId = normalizeNotionId(input);
  
  // Vérifier le format
  if (!NOTION_ID_REGEX.test(normalizedId) && normalizedId.length !== 32) {
    return {
      isValid: false,
      error: 'Format d\'ID Notion invalide',
      normalizedId
    };
  }
  
  // ID valide
  return {
    isValid: true,
    normalizedId
  };
}

/**
 * Vérifie si un ID de base de données est valide avec l'API Notion
 */
export async function verifyDatabaseIdWithAPI(
  databaseId: string, 
  apiToken: string
): Promise<IdValidationResult> {
  try {
    // Vérifier d'abord le format
    const formatValidation = validateNotionId(databaseId);
    if (!formatValidation.isValid) {
      return formatValidation;
    }
    
    const normalizedId = formatValidation.normalizedId!;
    
    // Importer dynamiquement pour éviter les dépendances cycliques
    const { notionApi } = await import('@/lib/notionProxy');
    
    // Tester l'accès à la base de données
    await notionApi.databases.retrieve(normalizedId, apiToken);
    
    // Si on arrive ici, l'ID est valide
    return {
      isValid: true,
      normalizedId
    };
  } catch (error) {
    // Logger l'erreur
    structuredLogger.error(
      'Échec de la validation de l\'ID de base de données',
      error,
      { source: 'DatabaseIdValidator', tags: ['security', 'validation'] }
    );
    
    // Créer un message d'erreur approprié
    let errorMessage = "Erreur lors de la validation de l'ID";
    
    if (error.status === 404) {
      errorMessage = "Base de données introuvable";
    } else if (error.status === 401) {
      errorMessage = "Non autorisé à accéder à cette base de données";
    } else if (error.status === 403) {
      errorMessage = "Permissions insuffisantes pour cette base de données";
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = "Impossible de se connecter à l'API Notion";
    }
    
    return {
      isValid: false,
      error: errorMessage,
      normalizedId: normalizeNotionId(databaseId)
    };
  }
}
