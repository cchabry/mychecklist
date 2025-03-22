
import { toast } from 'sonner';
import { OperationMode } from './types';

/**
 * Utilitaires pour la gestion des notifications du mode opérationnel
 */
export const operationModeNotifications = {
  /**
   * Affiche une notification lors d'un changement de mode
   */
  showModeChangeNotification(mode: OperationMode, reason: string | null = null): void {
    if (mode === OperationMode.DEMO) {
      toast.info('Mode démonstration activé', {
        description: reason || 'L\'application utilise maintenant des données fictives',
        duration: 5000
      });
    } else {
      toast.success('Mode réel activé', {
        description: 'L\'application est maintenant connectée à Notion',
        duration: 3000
      });
    }
  },
  
  /**
   * Affiche une notification lors d'un basculement automatique
   */
  showAutoSwitchNotification(failures: number): void {
    toast.warning('Basculement automatique en mode démonstration', {
      description: `Suite à ${failures} échecs consécutifs, l'application utilise maintenant des données fictives`,
      duration: 8000,
      action: {
        label: 'Réessayer en mode réel',
        onClick: () => {
          // Importer dynamiquement pour éviter les dépendances circulaires
          import('./operationModeService').then(({ operationMode }) => {
            operationMode.enableRealMode();
            toast.info('Tentative de reconnexion à Notion...');
          });
        }
      }
    });
  },
  
  /**
   * Affiche une notification lors d'une erreur de connexion
   */
  showConnectionErrorNotification(error: Error, context: string = 'Opération'): void {
    const errorMessage = error.message || 'Erreur inconnue';
    
    toast.error('Erreur de connexion', {
      description: `${context}: ${errorMessage}`,
      duration: 5000
    });
  }
};
