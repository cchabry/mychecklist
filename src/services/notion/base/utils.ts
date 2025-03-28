
/**
 * Utilitaires pour les services de base
 */

/**
 * Génère un ID pour les entités mock
 * @param prefix Préfixe pour l'ID (ex: "proj" pour "proj_123456")
 * @returns ID généré
 */
export function generateMockId(prefix: string = 'mock'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

