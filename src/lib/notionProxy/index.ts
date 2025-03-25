
/**
 * Point d'entrée principal pour l'API Notion
 * Utilise EXCLUSIVEMENT le service centralisé pour toutes les requêtes
 */

import { notionApiService } from '@/services/notion/notionApiService';

// Re-exporter le service API comme point d'entrée principal
export const notionApi = notionApiService;

// Exporter par défaut
export default notionApi;
