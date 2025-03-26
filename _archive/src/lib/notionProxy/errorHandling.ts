
/**
 * Utilitaires de gestion d'erreurs pour l'API Notion
 */

import { toast } from 'sonner';

// Types d'erreur
export type NotionErrorType = 'auth' | 'permission' | 'notFound' | 'network' | 'timeout' | 'cors' | 'unknown';

export interface NotionErrorDetails {
  message: string;
  type: NotionErrorType;
  originalError?: Error;
  context?: string;
  endpoint?: string;
  timestamp?: number;
}

/**
 * Extrait un message d'erreur plus lisible des réponses d'erreur de Notion
 */
export const extractNotionErrorMessage = (status: number, errorData: any): string => {
  if (!errorData) return `Erreur ${status}`;
  
  // Erreurs d'authentification
  if (status === 401) {
    return "Erreur d'authentification: La clé d'API Notion est invalide ou a expiré";
  }
  
  // Problèmes d'autorisation
  if (status === 403) {
    return "Erreur d'autorisation: Votre intégration Notion n'a pas accès à cette ressource";
  }
  
  // Problèmes de ressource non trouvée
  if (status === 404) {
    if (errorData.code === 'object_not_found') {
      return "Ressource introuvable: L'ID de base de données ou de page n'existe pas";
    }
    return "Ressource introuvable: Vérifiez les identifiants utilisés";
  }
  
  // Renvoyer le message d'erreur fourni par Notion si disponible
  return errorData.message || errorData.code 
    ? `Erreur Notion (${status}): ${errorData.message || errorData.code}`
    : `Erreur inattendue (${status})`;
};

/**
 * Détermine le type d'erreur Notion
 */
export const getNotionErrorType = (error: Error): NotionErrorType => {
  const message = error.message.toLowerCase();
  
  if (message.includes('auth') || message.includes('401') || message.includes('token')) {
    return 'auth';
  }
  
  if (message.includes('permission') || message.includes('403') || message.includes('access')) {
    return 'permission';
  }
  
  if (message.includes('not found') || message.includes('404') || message.includes('introuvable')) {
    return 'notFound';
  }
  
  if (message.includes('network') || message.includes('fetch') || message.includes('réseau')) {
    return 'network';
  }
  
  if (message.includes('timeout') || message.includes('expir') || message.includes('délai')) {
    return 'timeout';
  }
  
  if (message.includes('cors')) {
    return 'cors';
  }
  
  return 'unknown';
};

/**
 * Stocke les détails d'erreur dans le localStorage
 */
export const storeNotionError = (error: Error, endpoint?: string): void => {
  try {
    const errorType = getNotionErrorType(error);
    const errorDetails: NotionErrorDetails = {
      message: error.message,
      type: errorType,
      endpoint,
      timestamp: Date.now()
    };
    
    localStorage.setItem('notion_last_error', JSON.stringify(errorDetails));
  } catch (e) {
    // Ignorer les erreurs de localStorage
    console.error('Failed to store error in localStorage:', e);
  }
};

/**
 * Récupère les dernières erreurs stockées
 */
export const getStoredNotionError = (): NotionErrorDetails | null => {
  try {
    const storedError = localStorage.getItem('notion_last_error');
    return storedError ? JSON.parse(storedError) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Efface les erreurs stockées
 */
export const clearStoredNotionErrors = (): void => {
  localStorage.removeItem('notion_last_error');
};

/**
 * Gère une erreur Notion de manière standard
 */
export const handleNotionError = (error: Error, context?: string): NotionErrorDetails => {
  const errorType = getNotionErrorType(error);
  const errorDetails: NotionErrorDetails = {
    message: error.message,
    type: errorType,
    originalError: error,
    context,
    timestamp: Date.now()
  };
  
  // Stocker l'erreur
  storeNotionError(error);
  
  // Afficher un toast d'erreur
  let toastMessage = "Erreur avec l'API Notion";
  let toastDescription = error.message;
  
  switch (errorType) {
    case 'auth':
      toastMessage = "Erreur d'authentification";
      toastDescription = "Votre clé API Notion est invalide ou a expiré";
      break;
    case 'permission':
      toastMessage = "Erreur d'autorisation";
      toastDescription = "Votre intégration n'a pas accès à cette ressource";
      break;
    case 'notFound':
      toastMessage = "Ressource introuvable";
      toastDescription = "Vérifiez les identifiants de base de données ou de page";
      break;
    case 'network':
      toastMessage = "Erreur réseau";
      toastDescription = "Vérifiez votre connexion Internet";
      break;
    case 'cors':
      toastMessage = "Erreur CORS";
      toastDescription = "Le proxy CORS n'a pas pu accéder à l'API Notion";
      break;
  }
  
  toast.error(toastMessage, {
    description: toastDescription
  });
  
  return errorDetails;
};
