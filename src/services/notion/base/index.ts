
/**
 * Point d'entrée pour les services de base
 * 
 * Ce module exporte les classes et interfaces de base pour les services Notion.
 */

// Exporter la classe de base et les utilitaires
export { BaseNotionService, generateMockId } from './BaseNotionService';

// Exporter les interfaces de base
export type { StandardFilterOptions } from './BaseNotionService';

// Exporter les interfaces de service depuis le module de types
export { CrudService, ChildEntityService, BatchService } from '../types/ServiceInterfaces';
