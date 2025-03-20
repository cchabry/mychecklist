/**
 * Flag mockMode pour utiliser des données fictives au lieu de l'API Notion
 */
let isActive = false;
// Version du mock mode, à incrémenter lors des mises à jour majeures
const version = "v2";

// Scénario actuel (standard, empty, error, ou large)
let currentScenario = 'standard';

// Configuration du délai simulé (en ms)
let simulatedDelay = 0;

// Taux d'erreur simulé (0-100%)
let errorRate = 0;

/**
 * Active le mode mock pour les tests et la démo
 */
export const activate = () => {
  console.log("Mock mode activé (version " + version + ")");
  isActive = true;
  return true;
};

/**
 * Désactive le mode mock
 */
export const deactivate = () => {
  console.log("Mock mode désactivé");
  isActive = false;
  return false;
};

/**
 * Bascule l'état du mode mock
 */
export const toggle = () => {
  isActive = !isActive;
  console.log(`Mock mode ${isActive ? 'activé' : 'désactivé'} (version ${version})`);
  return isActive;
};

/**
 * Vérifie si le mode mock est actif
 */
export const isActive = () => {
  return isActive;
};

/**
 * Obtient la version actuelle du mock mode
 */
export const getVersion = () => {
  return version;
};

/**
 * Change le scénario de test
 * @param scenario - Le scénario à utiliser ('standard', 'empty', 'error', 'large')
 */
export const setScenario = (scenario: string) => {
  const validScenarios = ['standard', 'empty', 'error', 'large'];
  if (validScenarios.includes(scenario)) {
    currentScenario = scenario;
    console.log(`Scénario mock changé pour: ${scenario}`);
    return true;
  }
  console.warn(`Scénario invalide: ${scenario}`);
  return false;
};

/**
 * Obtient le scénario de test actuel
 */
export const getScenario = () => {
  return currentScenario;
};

/**
 * Configure le délai de réponse simulé
 * @param delay - Délai en millisecondes
 */
export const setDelay = (delay: number) => {
  simulatedDelay = Math.max(0, delay);
  console.log(`Délai de réponse simulé configuré à ${simulatedDelay}ms`);
  return simulatedDelay;
};

/**
 * Obtient le délai de réponse simulé actuel
 */
export const getDelay = () => {
  return simulatedDelay;
};

/**
 * Configure le taux d'erreur simulé
 * @param rate - Taux d'erreur (0-100%)
 */
export const setErrorRate = (rate: number) => {
  errorRate = Math.max(0, Math.min(100, rate));
  console.log(`Taux d'erreur simulé configuré à ${errorRate}%`);
  return errorRate;
};

/**
 * Obtient le taux d'erreur simulé actuel
 */
export const getErrorRate = () => {
  return errorRate;
};

/**
 * Détermine si une erreur doit être simulée en fonction du taux configuré
 */
export const shouldSimulateError = () => {
  return Math.random() * 100 < errorRate;
};

/**
 * Applique le délai simulé configuré
 */
export const applySimulatedDelay = async () => {
  if (simulatedDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));
  }
};

export const mockMode = {
  activate,
  deactivate,
  toggle,
  isActive,
  getVersion,
  setScenario,
  getScenario,
  setDelay,
  getDelay,
  setErrorRate,
  getErrorRate,
  shouldSimulateError,
  applySimulatedDelay
};
