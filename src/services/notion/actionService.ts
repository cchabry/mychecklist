
/**
 * Re-export du service d'actions (pour compatibilité avec le code existant)
 * @deprecated Utilisez plutôt l'import depuis './action/actionService'
 */

import { actionService } from './action/actionService';
import { progressService } from './action/progressService';

export { actionService, progressService };
export default { actionService, progressService };
