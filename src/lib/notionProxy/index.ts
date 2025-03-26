
/**
 * Point d'entrée principal pour l'API Notion
 * Utilise EXCLUSIVEMENT le service centralisé pour toutes les requêtes
 */

import { notionCentralService } from '@/services/notion/notionCentralService';

// Re-exporter le service centralisé comme API principale
export const notionApi = notionCentralService;

// Exporter par défaut
export default notionApi;
