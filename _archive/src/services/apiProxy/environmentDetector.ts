
import { DeploymentEnvironment } from './types';

/**
 * Détecte l'environnement de déploiement actuel
 * @returns L'environnement de déploiement détecté
 */
export function detectEnvironment(): DeploymentEnvironment {
  // Vérifier si nous sommes en environnement serveur ou navigateur
  if (typeof window === 'undefined') {
    // Logique côté serveur
    return detectServerEnvironment();
  } else {
    // Logique côté client (navigateur)
    return detectBrowserEnvironment();
  }
}

/**
 * Détecte l'environnement côté serveur
 */
function detectServerEnvironment(): DeploymentEnvironment {
  // Vérifier les variables d'environnement spécifiques à chaque plateforme
  if (process.env.NETLIFY) {
    return DeploymentEnvironment.Netlify;
  } else if (process.env.VERCEL) {
    return DeploymentEnvironment.Vercel;
  } else {
    return DeploymentEnvironment.Local;
  }
}

/**
 * Détecte l'environnement côté client (navigateur)
 */
function detectBrowserEnvironment(): DeploymentEnvironment {
  const hostname = window.location.hostname;
  
  // Détection basée sur l'URL
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DeploymentEnvironment.Local;
  } else if (hostname.includes('netlify.app') || hostname.endsWith('.netlify.com')) {
    return DeploymentEnvironment.Netlify;
  } else if (hostname.includes('vercel.app') || hostname.endsWith('.now.sh')) {
    return DeploymentEnvironment.Vercel;
  } else if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    return DeploymentEnvironment.Lovable;
  }
  
  // Détection basée sur les objets globaux ou propriétés spécifiques
  if ((window as any).netlify) {
    return DeploymentEnvironment.Netlify;
  } else if ((window as any).__NEXT_DATA__) {
    return DeploymentEnvironment.Vercel;
  }
  
  return DeploymentEnvironment.Unknown;
}

/**
 * Vérifie si l'environnement actuel est un environnement de développement
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development' || detectEnvironment() === DeploymentEnvironment.Local;
}

/**
 * Vérifie si l'environnement actuel est un environnement de production
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' && detectEnvironment() !== DeploymentEnvironment.Local;
}

/**
 * Obtient l'URL de base pour les fonctions serverless selon l'environnement
 */
export function getServerlessFunctionBaseUrl(): string {
  const env = detectEnvironment();
  
  switch (env) {
    case DeploymentEnvironment.Netlify:
      return '/.netlify/functions';
    case DeploymentEnvironment.Vercel:
      return '/api';
    case DeploymentEnvironment.Local:
      // En développement local, on peut configurer selon la configuration de proxy
      return process.env.VITE_SERVERLESS_FUNCTIONS_URL || '/api';
    default:
      return '/api';
  }
}
