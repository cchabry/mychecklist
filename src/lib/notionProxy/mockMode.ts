
import { mockMode } from './mock/mode';

/**
 * Re-export le mockMode depuis le nouveau chemin (pour compatibilité)
 * @deprecated Utilisez operationMode depuis services/operationMode à la place
 */
export { mockMode };

// Export par défaut pour la compatibilité
export default mockMode;
