
/**
 * Utilitaires pour la gestion des erreurs Notion
 */
import { NotionError, NotionErrorType } from '../types/unified';

export const errorUtils = {
  /**
   * Formate une erreur pour l'affichage dans l'interface utilisateur
   */
  formatErrorForDisplay(error: NotionError): { title: string; message: string } {
    const title = this.getErrorTitle(error.type);
    const message = error.message;
    
    return { title, message };
  },
  
  /**
   * Obtient un titre convivial pour un type d'erreur
   */
  getErrorTitle(type: NotionErrorType): string {
    switch (type) {
      case NotionErrorType.AUTH:
        return 'Erreur d\'authentification';
      case NotionErrorType.PERMISSION:
        return 'Erreur de permission';
      case NotionErrorType.NOT_FOUND:
        return 'Ressource introuvable';
      case NotionErrorType.VALIDATION:
        return 'Données invalides';
      case NotionErrorType.RATE_LIMIT:
        return 'Limite de requêtes atteinte';
      case NotionErrorType.TIMEOUT:
        return 'Délai dépassé';
      case NotionErrorType.CORS:
        return 'Erreur CORS';
      case NotionErrorType.NETWORK:
        return 'Erreur réseau';
      case NotionErrorType.SERVER:
        return 'Erreur serveur';
      case NotionErrorType.DATABASE:
        return 'Erreur de base de données';
      default:
        return 'Erreur inattendue';
    }
  },
  
  /**
   * Vérifie si une erreur est critique (nécessite une intervention)
   */
  isCriticalError(error: NotionError): boolean {
    return [
      NotionErrorType.AUTH,
      NotionErrorType.PERMISSION,
      NotionErrorType.DATABASE
    ].includes(error.type);
  },
  
  /**
   * Vérifie si une erreur est temporaire (peut se résoudre d'elle-même)
   */
  isTemporaryError(error: NotionError): boolean {
    return [
      NotionErrorType.NETWORK,
      NotionErrorType.TIMEOUT,
      NotionErrorType.RATE_LIMIT,
      NotionErrorType.SERVER
    ].includes(error.type);
  },
  
  /**
   * Génère une suggestion de résolution pour une erreur
   */
  getSuggestion(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return 'Vérifiez votre clé API Notion ou reconnectez-vous.';
      case NotionErrorType.PERMISSION:
        return 'Vérifiez les permissions de votre compte Notion sur cette ressource.';
      case NotionErrorType.NOT_FOUND:
        return 'Vérifiez l\'identifiant de la ressource ou si elle existe toujours.';
      case NotionErrorType.VALIDATION:
        return 'Vérifiez les données saisies et corrigez les erreurs.';
      case NotionErrorType.RATE_LIMIT:
        return 'Attendez quelques minutes avant de réessayer.';
      case NotionErrorType.TIMEOUT:
        return 'Vérifiez votre connexion internet et réessayez.';
      case NotionErrorType.CORS:
        return 'Utilisez le proxy pour les requêtes Notion.';
      case NotionErrorType.NETWORK:
        return 'Vérifiez votre connexion internet et réessayez.';
      case NotionErrorType.SERVER:
        return 'Réessayez plus tard, le serveur Notion est peut-être surchargé.';
      case NotionErrorType.DATABASE:
        return 'Vérifiez la structure de votre base de données Notion.';
      default:
        return 'Réessayez l\'opération ou contactez le support.';
    }
  }
};
