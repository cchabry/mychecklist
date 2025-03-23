
import { toast } from 'sonner';
import { OperationMode, SwitchReason } from './types';

/**
 * Service de notifications pour le système operationMode
 * Gère l'affichage des notifications liées aux changements de mode
 */
export const operationModeNotifications = {
  /**
   * Affiche une notification lors du changement de mode
   */
  showModeChangeNotification(mode: OperationMode, reason?: SwitchReason): void {
    if (mode === OperationMode.DEMO) {
      toast.info('Mode démonstration activé', {
        description: reason || 'L\'application utilise maintenant des données simulées',
        duration: 4000
      });
    } else {
      toast.success('Mode réel activé', {
        description: 'L\'application est maintenant connectée à l\'API Notion',
        duration: 4000
      });
    }
  },
  
  /**
   * Affiche une notification pour le basculement automatique
   */
  showAutoSwitchNotification(failures: number): void {
    toast.warning('Passage automatique en mode démonstration', {
      description: `Après ${failures} échec(s) de connexion, l'application est passée en mode démonstration.`,
      duration: 6000,
      action: {
        label: 'Réessayer en mode réel',
        onClick: () => {
          // Ce callback sera fourni par le composant qui utilise cette notification
          // Il appellera operationMode.enableRealMode()
          console.log('Action: tentative de retour au mode réel');
        }
      }
    });
  },
  
  /**
   * Affiche une notification d'erreur de connexion
   */
  showConnectionErrorNotification(error: Error, context: string): void {
    toast.error(`Erreur de connexion (${context})`, {
      description: error.message,
      duration: 5000
    });
  }
};
