
/**
 * Utilitaires communs pour le système de cache
 */

/**
 * Génère une clé de cache basée sur les paramètres
 */
export function generateCacheKey(
  baseKey: string,
  params?: Record<string, any>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }
  
  // Tri des clés pour assurer la cohérence
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as Record<string, any>);
  
  return `${baseKey}:${JSON.stringify(sortedParams)}`;
}

/**
 * Convertit une durée spécifiée sous différents formats en millisecondes
 */
export function parseDuration(duration: number | string): number {
  if (typeof duration === 'number') {
    return duration;
  }
  
  // Format: '1d', '2h', '30m', '45s'
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) {
    return parseInt(duration, 10) || 0;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000; // jours
    case 'h': return value * 60 * 60 * 1000;      // heures
    case 'm': return value * 60 * 1000;           // minutes
    case 's': return value * 1000;                // secondes
    default: return value;
  }
}

/**
 * Calcule le temps restant avant l'expiration d'une entrée
 */
export function getRemainingTime(expiryTimestamp: number | null): number {
  if (!expiryTimestamp) return Infinity;
  return Math.max(0, expiryTimestamp - Date.now());
}

/**
 * Formate une durée en millisecondes dans un format lisible
 */
export function formatDuration(ms: number): string {
  if (ms === Infinity) return 'sans expiration';
  if (ms <= 0) return 'expiré';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}j ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
