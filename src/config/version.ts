
/**
 * Configuration du versioning de l'application
 */
export const APP_VERSION = {
  major: 1,
  minor: 0,
  patch: 3,
  toString: function() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
};

// Mettre à jour le data-version dans le document HTML
document.documentElement.setAttribute('data-version', APP_VERSION.toString());

// Exporter la fonction pour récupérer la version courante
export function getCurrentVersion() {
  return APP_VERSION.toString();
}
