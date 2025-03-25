
/**
 * Point d'entrée principal pour les services Notion
 */

// Exporter le service API principal 
export { notionApiService } from './notionApiService';

// Exporter le service central pour un accès direct aux méthodes bas niveau
export { notionCentralService } from './notionCentralService';

// Exporter les types
export * from './client/types';

// Exporter le client de base
export * from './client';

// Exporter les configurations
export * from './config';

// Exporter les utilitaires de diagnostic
export * from './diagnostics';

// Exporter les services spécialisés
export * from './errorHandling';

// Exporter les optimisations
export * from './optimization';

// Exporter l'adaptateur de compatibilité
export { notionClientAdapter } from './compatibility/notionClientAdapter';

// Exporter le service principal
import { notionApiService } from './notionApiService';

// Exporter par défaut pour un accès rapide
export default notionApiService;
