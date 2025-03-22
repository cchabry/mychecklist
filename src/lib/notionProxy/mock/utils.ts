/**
 * Utilitaires pour travailler avec le mode mock
 */

import { mockMode } from '../mockMode';
import { mockState } from './state';
import { operationMode } from '@/services/operationMode';

/**
 * Version sécurisée de la vérification du mode mock
 * Fonctionne que isActive soit une propriété ou une fonction
 * @deprecated Utilisez operationMode.isDemoMode à la place
 */
export function isMockActive(): boolean {
  // Utiliser en priorité le nouveau système
  if (typeof operationMode !== 'undefined') {
    return operationMode.isDemoMode();
  }
  
  // Fallback sur l'ancien système
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
 * @deprecated Utilisez operationMode.enableRealMode() à la place
 */
export function temporarilyDisableMock(): void {
  // Utiliser en priorité le nouveau système
  if (typeof operationMode !== 'undefined') {
    operationMode.enableRealMode();
    return;
  }
  
  // Fallback sur l'ancien système
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
 * @deprecated Utilisez operationMode.enableDemoMode() à la place
 */
export function enableMock(): void {
  // Utiliser en priorité le nouveau système
  if (typeof operationMode !== 'undefined') {
    operationMode.enableDemoMode('Activation via enableMock()');
    return;
  }
  
  // Fallback sur l'ancien système
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
  // Utiliser en priorité le nouveau système
  if (typeof operationMode !== 'undefined') {
    const wasMock = operationMode.isDemoMode();
    if (wasMock) {
      operationMode.enableRealMode();
    }
    return wasMock;
  }
  
  // Fallback sur l'ancien système
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
  // Utiliser en priorité le nouveau système
  if (typeof operationMode !== 'undefined') {
    if (wasMock) {
      operationMode.enableDemoMode('Restoration après force real');
    }
    return;
  }
  
  // Fallback sur l'ancien système
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
  // Utiliser en priorité le nouveau système
  if (typeof operationMode !== 'undefined') {
    return wasMock && !operationMode.isDemoMode();
  }
  
  // Fallback sur l'ancien système
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
