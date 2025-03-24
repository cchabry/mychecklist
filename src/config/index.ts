
/**
 * Point d'entrée de la configuration de l'application 
 * Importe et initialise tous les modules de configuration
 */

// Importer et initialiser le versioning de l'application
import './version';

// Exporter le système de versioning pour un accès global
export { APP_VERSION, getCurrentVersion } from './version';

// Autres exports de configuration peuvent être ajoutés ici

/**
 * Initialise les configurations globales de l'application
 */
export function initAppConfig() {
  console.log('Application configurée avec version:', APP_VERSION.toString());
  // Autres initialisations de configuration peuvent être ajoutées ici
}
