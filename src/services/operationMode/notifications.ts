
import { toast } from 'sonner';
import { operationMode } from './operationModeService';
import { Database, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

/**
 * Utilitaire de notifications pour le système operationMode
 */
export const operationModeNotifications = {
  /**
   * Affiche une notification de passage en mode démo
   */
  notifyDemoMode: (reason?: string) => {
    toast.info('Mode démonstration activé', {
      description: reason || 'L\'application utilise maintenant des données simulées',
      icon: React.createElement(Database, { size: 16, className: "text-blue-500" }),
      duration: 5000
    });
  },

  /**
   * Affiche une notification de passage en mode réel
   */
  notifyRealMode: () => {
    toast.success('Mode réel activé', {
      description: 'L\'application se connecte maintenant à Notion',
      icon: React.createElement(Info, { size: 16, className: "text-green-500" }),
      duration: 5000
    });
  },

  /**
   * Affiche une notification d'erreur avec action de basculement
   */
  notifyConnectionError: (error: Error, context?: string) => {
    toast.error(context || 'Erreur de connexion', {
      description: error.message,
      duration: 8000,
      action: {
        label: 'Passer en mode démo',
        onClick: () => {
          operationMode.enableDemoMode('Activation manuelle suite à une erreur');
          toast.info('Mode démonstration activé');
        }
      }
    });
  },

  /**
   * Affiche une notification de basculement automatique
   */
  notifyAutoSwitch: (failures: number) => {
    toast.warning('Passage automatique en mode démonstration', {
      description: `Après ${failures} échecs de connexion, l'application utilise maintenant des données simulées.`,
      duration: 8000,
      action: {
        label: 'Réessayer en mode réel',
        onClick: () => {
          operationMode.enableRealMode();
          toast.info('Tentative de reconnexion à Notion...');
        }
      }
    });
  },
  
  /**
   * Affiche une notification pour les paramètres mis à jour
   */
  notifySettingsUpdated: (settingName: string, enabled: boolean) => {
    toast.info(`Paramètre mis à jour: ${settingName}`, {
      description: enabled ? 'Paramètre activé' : 'Paramètre désactivé',
      duration: 3000
    });
  }
};
