
/**
 * Re-export du service d'audits (pour compatibilité avec le code existant)
 * @deprecated Utilisez plutôt l'import depuis './audit/auditService'
 */

import { auditService } from './audit/auditService';

export { auditService };
export default { auditService };
