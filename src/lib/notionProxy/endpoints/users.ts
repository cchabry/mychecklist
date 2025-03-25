
import { legacyApiAdapter } from '../adapters';

/**
 * Récupère l'utilisateur courant
 */
export const me = (token: string) => {
  return legacyApiAdapter('/users/me', 'GET', null, token);
};

/**
 * Liste les utilisateurs
 */
export const list = (token: string) => {
  return legacyApiAdapter('/users', 'GET', null, token);
};
