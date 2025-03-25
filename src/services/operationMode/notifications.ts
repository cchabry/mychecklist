
import { OperationMode } from './types';
import { toast } from 'sonner';

/**
 * Utilitaires pour afficher des notifications liées au mode opérationnel
 */
export const operationModeNotifications = {
  /**
   * Affiche une notification de changement de mode
   */
  showModeChangeNotification(mode: OperationMode, reason?: string): void {
    if (mode === OperationMode.DEMO) {
      toast.info('Mode démo activé', {
        description: reason || 'L\'application utilise maintenant des données simulées'
      });
    } else {
      toast.success('Mode réel activé', {
        description: 'L\'application utilise maintenant l\'API Notion'
      });
    }
  },
  
  /**
   * Affiche une notification de basculement automatique
   */
  showAutoSwitchNotification(failureCount: number): void {
    toast.warning('Basculement automatique en mode démo', {
      description: `Après ${failureCount} échecs consécutifs de connexion`
    });
  },
  
  /**
   * Affiche une notification d'erreur de connexion
   */
  showConnectionErrorNotification(error: Error, context?: string): void {
    toast.error(`Erreur de connexion${context ? ` (${context})` : ''}`, {
      description: error.message
    });
  }
};
