
/**
 * Point d'entrée principal pour les services Notion
 * Intègre le nouveau client avec l'abstraction de proxy API
 */

// Exporter la nouvelle API client (version moderne)
export * from './client';

// Exporter le système de configuration
export * from './config';

// Compatibilité avec l'ancien code
import { notionClientAdapter } from './compatibility/notionClientAdapter';
import { ConnectionStatus } from './client/legacy';

// Exporter les hooks et utilitaires communs
export * from './hooks';
export * from './utils';

// Exporter les services spécifiques
export * from './projects';
export * from './checklist';
export * from './audits';
export * from './exigences';
export * from './samples';
export * from './diagnostics';

// Ajouter l'interface de compatibilité vers l'ancien client
export const notionClient = notionClientAdapter;

// Re-exporter certains types et enums pour la compatibilité
export { ConnectionStatus };

// Exporter le nouveau service comme interface principale
export { notionService } from './client';
export default notionService;
