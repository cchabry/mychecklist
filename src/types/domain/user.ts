
/**
 * Types pour les utilisateurs
 */

/**
 * Interface pour un utilisateur
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
}
