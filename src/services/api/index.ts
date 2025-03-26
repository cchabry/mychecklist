
/**
 * Point d'entrée principal pour les services API
 */

// Exporter l'API Notion refactorisée
export { notionApi } from '../notion/notionApiImpl';

// Exporter les APIs par domaine pour un accès direct si nécessaire
export * from '../notion/api';

// Exporter les types d'API
export * from '@/types/api';

