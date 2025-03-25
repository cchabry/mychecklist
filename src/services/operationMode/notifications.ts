import { toast } from 'sonner';
import { OperationMode } from './types';
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
   */
  showAutoSwitchNotification(failures: number): void {
    toast.warning('Basculement automatique en mode démonstration', {
      description: `Après ${failures} tentatives de connexion échouées, le mode démonstration a été activé automatiquement.`,
      duration: 6000,
      action: {
        label: 'Réessayer le mode réel',
        onClick: () => {
          operationMode.enableRealMode();
        },
      },
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
    toast.info('Problème de connexion détecté', {
      description: 'Souhaitez-vous activer le mode démonstration pour continuer à utiliser l\'application ?',
      duration: 10000,
      action: {
        label: 'Activer',
        onClick: () => {
          operationMode.enableDemoMode('Activé suite à une suggestion après erreur');
        },
      },
    });
  }
};
