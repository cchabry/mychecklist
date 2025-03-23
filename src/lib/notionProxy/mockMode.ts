
/**
 * FICHIER DE COMPATIBILITÉ TEMPORAIRE
 * 
 * @deprecated Ce fichier sera supprimé après la migration complète.
 * Utilisez directement operationMode à la place.
 */
import { operationMode } from '@/services/operationMode';

// Adaptateur mockMode pour compatibilité avec l'ancien code
export const mockMode = {
  /**
   * Vérifie si le mode démonstration est actif
   * @deprecated Utilisez operationMode.isDemoMode
   */
  isActive: () => operationMode.isDemoMode,
  
  /**
   * Active le mode démonstration
   * @deprecated Utilisez operationMode.enableDemoMode()
   */
  activate: () => operationMode.enableDemoMode('Activation via adaptateur (mockMode.activate)'),
  
  /**
   * Désactive le mode démonstration (active le mode réel)
   * @deprecated Utilisez operationMode.enableRealMode()
   */
  deactivate: () => operationMode.enableRealMode(),
  
  /**
   * Bascule entre les modes
   * @deprecated Utilisez operationMode.toggle()
   */
  toggle: () => operationMode.toggle(),
  
  /**
   * Désactive temporairement le mode démonstration
   * @deprecated Cette fonctionnalité n'est plus supportée
   */
  temporarilyForceReal: () => operationMode.enableRealMode(),
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   * @deprecated Cette fonctionnalité n'est plus supportée
   */
  isTemporarilyForcedReal: () => !operationMode.isDemoMode,
  
  /**
   * Restaure l'état du mode après forçage temporaire
   * @deprecated Cette fonctionnalité n'est plus supportée
   */
  restoreAfterForceReal: () => {}
};

// Exporter par défaut pour compatibilité
export default mockMode;
