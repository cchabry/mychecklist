
/**
 * Système de stockage pour les données mockées de Notion
 * Utilise le localStorage pour persister les données entre les rechargements
 */

const STORAGE_KEY = 'notion_proxy_storage';

/**
 * Interface pour le stockage des données mockées
 */
interface MockStorage {
  projects: Record<string, any>;
  audits: Record<string, any>;
  checklistItems: Record<string, any>;
  samplePages: Record<string, any>;
  exigences: Record<string, any>;
  evaluations: Record<string, any>;
  actions: Record<string, any>;
  progress: Record<string, any>;
  lastUpdate: string;
}

/**
 * Stockage initial vide
 */
const emptyStorage: MockStorage = {
  projects: {},
  audits: {},
  checklistItems: {},
  samplePages: {},
  exigences: {},
  evaluations: {},
  actions: {},
  progress: {},
  lastUpdate: new Date().toISOString()
};

/**
 * Récupère les données stockées
 * @returns Les données stockées ou un stockage vide si aucune donnée n'est trouvée
 */
export const getStorage = (): MockStorage => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : emptyStorage;
  } catch (error) {
    console.error('Erreur lors de la récupération du stockage:', error);
    return emptyStorage;
  }
};

/**
 * Sauvegarde les données dans le stockage
 * @param storage Les données à stocker
 */
export const saveStorage = (storage: MockStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...storage,
      lastUpdate: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du stockage:', error);
  }
};

/**
 * Vérifie si le stockage existe déjà
 * @returns true si le stockage existe, false sinon
 */
export const hasExistingStorage = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification du stockage:', error);
    return false;
  }
};

/**
 * Réinitialise le stockage aux valeurs par défaut
 */
export const resetStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du stockage:', error);
  }
};

// Exporter les fonctions et interfaces
export type { MockStorage };
