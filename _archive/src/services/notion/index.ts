
/**
 * Point d'entrée principal pour les services Notion
 */

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
import { notionService } from './client';

// Exporter par défaut pour un accès rapide
export default notionService;
