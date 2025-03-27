
/**
 * Re-export du service d'évaluations (pour compatibilité avec le code existant)
 * @deprecated Utilisez plutôt l'import depuis './evaluation/evaluationService'
 */

import { evaluationService } from './evaluation/evaluationService';

export { evaluationService };
export default evaluationService;
