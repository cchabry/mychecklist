
import { corsProxyService } from './corsProxyService';

// Exporter une instance unique du service de proxy CORS
export const corsProxy = corsProxyService;

// Réexporter les types pour être utilisés par les consommateurs
export * from './types';
