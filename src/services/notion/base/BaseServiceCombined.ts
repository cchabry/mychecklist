
/**
 * Point d'entrée principal pour BaseNotionService
 * 
 * Ce fichier réexporte la classe finale BaseNotionServiceAbstract sous le nom
 * de BaseNotionService pour maintenir la compatibilité avec le code existant.
 */

import { BaseNotionServiceAbstract } from './BaseNotionServiceAbstract';

/**
 * Classe finale BaseNotionService
 * 
 * Pour la compatibilité avec le code existant, nous exportons directement
 * BaseNotionServiceAbstract sous le nom BaseNotionService.
 */
export class BaseNotionService<
  T extends { id: ID },
  C extends Partial<Omit<T, 'id'>>,
  U = T,
  ID = string
> extends BaseNotionServiceAbstract<T, C, U, ID> {}

