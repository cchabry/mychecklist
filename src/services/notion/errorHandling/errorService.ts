
import { 
  NotionError, 
  NotionErrorSubscriber,
  NotionErrorType,
  NotionErrorSeverity,
  NotionErrorOptions
} from './types';
import { notionErrorUtils } from './utils';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

/**
 * Service central de gestion des erreurs Notion
 */
class NotionErrorService {
  private subscribers: NotionErrorSubscriber[] = [];
  private recentErrors: NotionError[] = [];
  private maxRecentErrors: number = 10;
  
  /**
   * Traite une erreur et déclenche les réponses appropriées
   */
  public handleError(error: Error, context: Record<string, any> = {}): NotionError {
    // Enrichir l'erreur avec des informations supplémentaires
    const enhancedError = notionErrorUtils.enhanceError(error, context);
    
    // Journaliser l'erreur
    this.logError(enhancedError);
    
    // Stocker l'erreur dans l'historique
    this.storeError(enhancedError);
    
    // Notifier les abonnés
    this.notifySubscribers(enhancedError);
    
    // Afficher une notification à l'utilisateur
    this.showNotification(enhancedError);
    
    // Gérer le basculement automatique en mode démo si nécessaire
    this.handleAutoSwitch(enhancedError);
    
    return enhancedError;
  }
  
  /**
   * Crée une erreur Notion personnalisée
   */
  public createError(message: string, options: NotionErrorOptions = {}): NotionError {
    return notionErrorUtils.createError(message, options);
  }
  
  /**
   * S'abonner aux erreurs
   */
  public subscribe(subscriber: NotionErrorSubscriber): () => void {
    this.subscribers.push(subscriber);
    
    // Retourner la fonction de désabonnement
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Récupère les erreurs récentes
   */
  public getRecentErrors(): NotionError[] {
    return [...this.recentErrors];
  }
  
  /**
   * Efface l'historique des erreurs
   */
  public clearErrors(): void {
    this.recentErrors = [];
  }
  
  /**
   * Journalise l'erreur dans la console
   */
  private logError(error: NotionError): void {
    const { type, severity, context, recoveryActions } = error;
    
    console.group(`Notion Error: ${type.toUpperCase()} (${severity})`);
    console.error('Message:', error.message);
    console.info('Context:', context);
    console.info('Recovery actions:', recoveryActions);
    console.info('Stack:', error.stack);
    console.groupEnd();
  }
  
  /**
   * Stocke l'erreur dans l'historique des erreurs récentes
   */
  private storeError(error: NotionError): void {
    this.recentErrors.unshift(error);
    
    // Limiter la taille de l'historique
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors = this.recentErrors.slice(0, this.maxRecentErrors);
    }
  }
  
  /**
   * Notifie tous les abonnés d'une erreur
   */
  private notifySubscribers(error: NotionError): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(error);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné:', e);
      }
    });
  }
  
  /**
   * Affiche une notification à l'utilisateur
   */
  private showNotification(error: NotionError): void {
    const { type, severity, recoveryActions } = error;
    
    const title = this.getErrorTitle(type);
    const description = error.message;
    
    // Adapter le type de toast à la gravité
    switch (severity) {
      case NotionErrorSeverity.INFO:
        toast.info(title, { description });
        break;
        
      case NotionErrorSeverity.WARNING:
        toast.warning(title, { 
          description,
          action: recoveryActions.length > 0 ? {
            label: 'Passer en démo',
            onClick: () => operationMode.enableDemoMode('Erreur Notion: ' + error.message)
          } : undefined
        });
        break;
        
      case NotionErrorSeverity.ERROR:
      case NotionErrorSeverity.CRITICAL:
        toast.error(title, { 
          description,
          duration: 8000,
          action: recoveryActions.length > 0 ? {
            label: 'Passer en démo',
            onClick: () => operationMode.enableDemoMode('Erreur Notion: ' + error.message)
          } : undefined
        });
        break;
    }
  }
  
  /**
   * Obtient un titre d'erreur en fonction du type
   */
  private getErrorTitle(type: NotionErrorType): string {
    switch (type) {
      case NotionErrorType.NETWORK:
        return 'Erreur de connexion';
        
      case NotionErrorType.AUTH:
        return 'Erreur d\'authentification';
        
      case NotionErrorType.PERMISSION:
        return 'Erreur de permission';
        
      case NotionErrorType.RATE_LIMIT:
        return 'Limite d\'API atteinte';
        
      case NotionErrorType.VALIDATION:
        return 'Erreur de validation';
        
      case NotionErrorType.DATABASE:
        return 'Erreur de base de données';
        
      case NotionErrorType.UNKNOWN:
      default:
        return 'Erreur Notion';
    }
  }
  
  /**
   * Gère le basculement automatique en mode démo si nécessaire
   */
  private handleAutoSwitch(error: NotionError): void {
    // Signaler l'erreur au service operationMode
    operationMode.handleConnectionError(
      error, 
      `Notion API (${error.type})`
    );
  }
}

// Créer et exporter l'instance du service
export const notionErrorService = new NotionErrorService();
