
/**
 * Point d'entrée principal pour l'API Notion
 * Utilise EXCLUSIVEMENT le service centralisé pour toutes les requêtes
 * via un adaptateur de compatibilité
 */

import { notionCentralService } from '@/services/notion/notionCentralService';
import { compatibilityNotionApi } from './compatibilityAdapter';

// Exporter l'adaptateur de compatibilité comme API principale
// Cela assure la compatibilité avec l'ancien code
export const notionApi = compatibilityNotionApi;

// Également exporter le service centralisé pour le nouveau code
export const notionService = notionCentralService;

// Exporter par défaut l'adaptateur de compatibilité
export default notionApi;
