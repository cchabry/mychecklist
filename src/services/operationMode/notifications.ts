
import { toast } from 'sonner';
import { OperationMode } from './index';
import { operationMode } from './operationModeService';

/**
 * Service de gestion des notifications pour le système operationMode
 */
export const operationModeNotifications = {
  /**
   * Affiche une notification lors du changement de mode opérationnel
   */
  showModeChangeNotification(mode: OperationMode, reason?: string | null): void {
    if (mode === OperationMode.DEMO) {
      toast.info('Mode démonstration activé', {
        description: reason || 'Utilisation de données de démonstration',
        duration: 4000,
      });
    } else {
      toast.success('Mode réel activé', {
        description: 'Connexion aux services API activée',
        duration: 3000,
      });
    }
  },

  /**
   * Affiche une notification en cas de basculement automatique
   * (Désactivé car nous préférons voir les erreurs)
   */
  showAutoSwitchNotification(failures: number): void {
    toast.error('Plusieurs erreurs de connexion détectées', {
      description: `${failures} tentatives de connexion ont échoué. Vérifiez la configuration et les erreurs.`,
      duration: 6000,
    });
  },

  /**
   * Affiche une notification d'erreur de connexion
   */
  showConnectionErrorNotification(error: Error, context: string): void {
    toast.error(`Erreur de connexion: ${context}`, {
      description: error.message,
      duration: 5000,
    });
  },

  /**
   * Affiche une notification pour conseiller l'utilisation du mode démo
   */
  showSuggestDemoModeNotification(): void {
    toast.info('Option disponible: mode démonstration', {
      description: 'Vous pouvez activer le mode démonstration pour utiliser des données fictives.',
      duration: 10000,
      action: {
        label: 'Activer',
        onClick: () => {
          operationMode.enableDemoMode('Activé manuellement');
        },
      },
    });
  }
};
