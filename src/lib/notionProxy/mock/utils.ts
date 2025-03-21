
/**
 * Utilitaires pour travailler avec le mode mock
 */

import { mockMode } from '../mockMode';
import { mockState } from './state';

/**
 * Version sécurisée de la vérification du mode mock
 * Fonctionne que isActive soit une propriété ou une fonction
 */
export function isMockActive(): boolean {
  try {
    // Try as a function first
    return mockMode.isActive();
  } catch (e) {
    try {
      // If it fails, try as a property (in case it's implemented that way)
      // @ts-ignore - we're handling the property vs function case
      return mockMode.isActive;
    } catch (err) {
      console.warn('Erreur lors de la vérification du mode mock:', err);
      return false;
    }
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

/**
 * Applique un délai simulé pour les opérations mock
 */
export async function applySimulatedDelay(): Promise<void> {
  const delay = mockState.getConfig().delay || 300;
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Détermine si une erreur doit être simulée
 */
export function shouldSimulateError(): boolean {
  const errorRate = mockState.getConfig().errorRate || 0;
  return Math.random() * 100 < errorRate;
}

/**
 * Force temporairement le mode réel pour une opération
 * @returns {boolean} True si le mode mock était actif et a été désactivé
 */
export function temporarilyForceReal(): boolean {
  const wasMock = isMockActive();
  if (wasMock) {
    temporarilyDisableMock();
  }
  return wasMock;
}

/**
 * Restaure le mode mock après une opération en mode réel forcé
 * @param {boolean} wasMock - Si le mode mock était actif avant
 */
export function restoreAfterForceReal(wasMock: boolean): void {
  if (wasMock) {
    enableMock();
  }
}

/**
 * Vérifie si le mode réel est temporairement forcé
 * @param {boolean} wasMock - Si le mode mock était actif avant
 * @returns {boolean} True si on est en mode réel forcé
 */
export function isTemporarilyForcedReal(wasMock: boolean): boolean {
  return wasMock && !isMockActive();
}

/**
 * Exporte les utilitaires du mode mock pour une utilisation facile
 */
export const mockUtils = {
  isMockActive,
  temporarilyDisableMock,
  enableMock,
  applySimulatedDelay,
  shouldSimulateError,
  temporarilyForceReal,
  restoreAfterForceReal,
  isTemporarilyForcedReal
};
