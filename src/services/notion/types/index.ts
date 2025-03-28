
/**
 * Types pour les services Notion
 * 
 * Ce module centralise les types utilisés par les services Notion.
 */

// Exporter les types de base
export * from './BasicTypes';
export * from './ClientTypes';
export type { NotionConfig } from '../base/types';
export * from './EntityTypes';

// Re-export explicite pour éviter les ambiguïtés
import { NotionResponse as BasicNotionResponse } from './BasicTypes';
import { NotionResponse as ResponseNotionResponse } from './ResponseTypes';
import { StandardFilterOptions as BasicFilterOptions } from './BasicTypes';
import { StandardFilterOptions as ResponseFilterOptions } from './ResponseTypes';

// Exporter avec des noms explicites pour éviter les ambiguïtés
export { 
  BasicNotionResponse,
  ResponseNotionResponse,
  // Utiliser une définition explicite
  BasicFilterOptions,
  ResponseFilterOptions
};

// Alias pour simplicité
export type NotionResponse<T> = BasicNotionResponse<T>;
export type StandardFilterOptions = BasicFilterOptions;

// Exporter les autres types de ResponseTypes
export * from './ResponseTypes';

export * from './ServiceInterfaces';

// Exporter les types spécifiques aux entités
export * from './ConfigTypes';
