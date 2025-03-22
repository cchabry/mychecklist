
import { toast } from 'sonner';
import { Activity, Database, AlertTriangle } from 'lucide-react';
import { OperationMode } from './types';
import React from 'react';

/**
 * Utilitaires pour gérer les notifications du mode opérationnel
 */
export const operationModeNotifications = {
  /**
   * Affiche une notification lors du changement de mode
   */
  showModeChangeNotification: (newMode: OperationMode, reason: string | null): void => {
    if (newMode === OperationMode.DEMO) {
      toast.info('Mode démonstration activé', {
        description: reason || 'Utilisation de données simulées',
        icon: React.createElement(Database, { size: 16, className: 'text-blue-500' }),
        duration: 4000,
      });
    } else {
      toast.success('Mode réel activé', {
        description: 'Connexion aux données Notion',
        icon: React.createElement(Activity, { size: 16, className: 'text-green-500' }),
        duration: 4000,
      });
    }
  },

  /**
   * Affiche une notification lors d'une erreur de connexion
   */
  showConnectionErrorNotification: (error: Error, context: string): void => {
    toast.error('Problème de connexion', {
      description: `Erreur lors de ${context}: ${error.message}`,
      icon: React.createElement(AlertTriangle, { size: 16, className: 'text-red-500' }),
      duration: 8000,
      action: {
        label: 'Passer en démo',
        onClick: () => {
          // Import direct pour éviter les dépendances circulaires
          const { operationMode } = require('./operationModeService');
          operationMode.enableDemoMode(`Erreur dans ${context}`);
        }
      }
    });
  },
  
  /**
   * Affiche une notification pour les actions automatiques du système
   */
  showAutoSwitchNotification: (failures: number): void => {
    toast.warning('Passage automatique en mode démonstration', {
      description: `Après ${failures} échecs consécutifs de connexion à Notion`,
      icon: React.createElement(AlertTriangle, { size: 16, className: 'text-amber-500' }),
      duration: 6000,
      action: {
        label: 'Réessayer',
        onClick: () => {
          // Import direct pour éviter les dépendances circulaires
          const { operationMode } = require('./operationModeService');
          operationMode.enableRealMode();
        }
      }
    });
  }
};
