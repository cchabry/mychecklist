
/**
 * Fonctions utilitaires courantes pour le cache
 */

import { cacheManager } from '../managers/defaultManager';

/**
 * Génère une clé de cache basée sur les paramètres
 * @param baseKey Clé de base
 * @param params Paramètres à inclure dans la clé
 * @returns Une clé unique incluant les paramètres
 */
export function generateCacheKey(baseKey: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }
  
  // Transformer les paramètres en chaîne triée et réduite pour être déterministe
  const paramsString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => {
      // Pour les objets et tableaux, utiliser JSON.stringify
      const valueStr = typeof value === 'object' 
        ? JSON.stringify(value)
        : String(value);
      
      return `${key}:${valueStr}`;
    })
    .join('&');
  
  return `${baseKey}:${paramsString}`;
}

/**
 * Analyse la durée fournie sous forme de chaîne et la convertit en millisecondes
 * Exemples: '5m', '1h', '1d'
 * @param duration Durée sous forme de chaîne
 * @param defaultValue Valeur par défaut si la durée est invalide
 * @returns Durée en millisecondes
 */
export function parseDuration(duration: string | number, defaultValue: number = 0): number {
  // Si c'est déjà un nombre, le retourner directement
  if (typeof duration === 'number') {
    return duration;
  }
  
  // Vérifier si la chaîne est valide
  if (!duration || typeof duration !== 'string') {
    return defaultValue;
  }
  
  // Analyser la chaîne
  const match = duration.match(/^(\d+)([smhd])$/);
  
  if (!match) {
    return defaultValue;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  // Convertir en millisecondes selon l'unité
  switch (unit) {
    case 's': return value * 1000; // secondes
    case 'm': return value * 60 * 1000; // minutes
    case 'h': return value * 60 * 60 * 1000; // heures
    case 'd': return value * 24 * 60 * 60 * 1000; // jours
    default: return defaultValue;
  }
}

/**
 * Calcule la durée restante avant l'expiration d'une entrée de cache
 * @param expiry Timestamp d'expiration
 * @returns Durée restante en millisecondes ou null si pas d'expiration
 */
export function getRemainingTime(expiry: number | null): number | null {
  if (expiry === null) {
    return null;
  }
  
  const now = Date.now();
  const remaining = expiry - now;
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Formate une durée en millisecondes en format lisible
 * @param ms Durée en millisecondes
 * @returns Chaîne formatée (ex: "5m 30s")
 */
export function formatDuration(ms: number | null): string {
  if (ms === null) {
    return 'Permanent';
  }
  
  if (ms <= 0) {
    return 'Expiré';
  }
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}
