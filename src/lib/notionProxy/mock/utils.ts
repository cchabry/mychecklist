
/**
 * Utilitaires pour travailler avec le mode mock
 */

import { mockMode } from '../mockMode';

/**
 * Version sécurisée de la vérification du mode mock
 * Fonctionne que isActive soit une propriété ou une fonction
 */
export function isMockActive(): boolean {
  try {
    // Try as a function first (legacy)
    return mockMode.isActive();
  } catch (e) {
    // If it fails, try as a property (new version)
    // @ts-ignore - we're handling the property vs function case
    return mockMode.isActive;
  }
}

/**
 * Désactive temporairement le mode mock pour les appels d'API
 */
export function temporarilyDisableMock(): void {
  try {
    if (typeof mockMode.forceReset === 'function') {
      mockMode.forceReset();
    } else {
      mockMode.deactivate();
    }
  } catch (e) {
    // Fallback
    console.warn('Erreur lors de la désactivation du mode mock:', e);
  }
}

/**
 * Active le mode mock
 */
export function enableMock(): void {
  try {
    mockMode.activate();
  } catch (e) {
    console.warn('Erreur lors de l\'activation du mode mock:', e);
  }
}
