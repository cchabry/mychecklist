
import { OperationModeSettings } from './types';

/**
 * Paramètres par défaut pour le système operationMode
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  // Mode opérationnel actuel
  mode: 'real',
  
  // Bascule automatique en mode démo après un certain nombre d'échecs
  autoSwitchEnabled: true,
  
  // Nombre d'échecs consécutifs avant basculement automatique
  failuresThreshold: 3,
  
  // Gestion des erreurs (auto ou manuel)
  errorHandling: 'auto',
  
  // Basculer automatiquement en mode démo lors d'erreurs
  autoSwitchOnErrors: true
};
