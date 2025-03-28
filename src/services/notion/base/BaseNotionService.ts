
/**
 * Exporte BaseNotionService comme un alias de BaseServiceCombined
 * pour assurer la compatibilité avec le code existant
 */

import { BaseServiceCombined } from './BaseServiceCombined';

/**
 * Alias de BaseServiceCombined pour maintenir la compatibilité
 */
export class BaseNotionService<T, C, U, ID = string> extends BaseServiceCombined<T, C, U, ID> {}
