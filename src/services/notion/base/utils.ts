
/**
 * Utilitaire pour générer un ID mock
 * @param prefix Préfixe pour l'ID
 * @returns ID unique basé sur un timestamp
 */
export function generateMockId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
