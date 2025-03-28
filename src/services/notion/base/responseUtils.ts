
/**
 * Utilitaires pour gérer les réponses Notion
 * 
 * Ce module fournit des fonctions pour standardiser les réponses des services Notion
 * et respecter les contrats d'interface attendus.
 */

import { NotionResponse, NotionError } from './types';

/**
 * Crée une réponse Notion de succès avec des données
 * 
 * @param data - Les données à inclure dans la réponse
 * @returns Une réponse Notion correctement formatée
 */
export function createSuccessResponse<T>(data: T): NotionResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Crée une réponse Notion d'erreur
 * 
 * @param message - Message d'erreur principal
 * @param error - Objet d'erreur optionnel contenant plus de détails
 * @returns Une réponse Notion d'erreur correctement formatée
 */
export function createErrorResponse<T>(message: string, error?: Partial<NotionError>): NotionResponse<T> {
  return {
    success: false,
    error: {
      message,
      ...error
    }
  };
}

/**
 * Enveloppe une valeur dans une réponse Notion de succès
 * Utile pour adapter les méthodes qui retournent des valeurs directes
 * 
 * @param value - La valeur à envelopper
 * @returns Une réponse Notion de succès contenant la valeur
 */
export function wrapInResponse<T>(value: T): NotionResponse<T> {
  return createSuccessResponse(value);
}

/**
 * Enveloppe une promesse simple dans une promesse de réponse Notion
 * Utile pour adapter les méthodes async qui retournent des valeurs directes
 * 
 * @param promise - La promesse à envelopper
 * @returns Une promesse résolvant vers une réponse Notion
 */
export async function wrapPromiseInResponse<T>(promise: Promise<T>): Promise<NotionResponse<T>> {
  try {
    const result = await promise;
    return createSuccessResponse(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return createErrorResponse(errorMessage);
  }
}
