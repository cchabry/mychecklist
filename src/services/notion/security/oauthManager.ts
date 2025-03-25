
/**
 * Module OAuth Manager neutralisé
 * 
 * Ce module existe uniquement pour éviter les erreurs d'importation,
 * toutes les fonctionnalités sont désactivées car l'authentification
 * est maintenant gérée côté serveur via les fonctions Netlify.
 */

export const isAuthenticated = () => true;
export const getTokenInfo = () => ({ expiresAt: null, needsRefresh: false });
export const startAuthFlow = () => console.log('Fonction OAuth désactivée');
export const refreshAccessToken = async () => true;
export const logout = async () => true;
export const setTokenRefreshCallback = () => {};

// Exporter un objet par défaut pour compatibilité
const oauthManager = {
  isAuthenticated,
  getTokenInfo,
  startAuthFlow,
  refreshAccessToken,
  logout,
  setTokenRefreshCallback
};

export default oauthManager;

// Types pour compatibilité
export const NotionOAuthConfig = {
  clientId: '',
  redirectUri: ''
};

export const NotionOAuthTokens = {
  accessToken: '',
  refreshToken: '',
  expiresAt: null
};
