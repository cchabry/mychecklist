/**
 * Utilitaires pour le système de cache
 */

import { cacheManager } from './cacheManager';

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

/**
 * Classe d'abstraction pour gérer le cache d'un type d'entité spécifique
 */
export class EntityCache<T> {
  private cachePrefix: string;
  
  constructor(entityName: string) {
    this.cachePrefix = `entity:${entityName}:`;
  }
  
  /**
   * Récupère une entité par son ID
   */
  getById(id: string): T | null {
    return cacheManager.get<T>(`${this.cachePrefix}${id}`);
  }
  
  /**
   * Récupère une liste d'entités
   */
  getList(listKey: string = 'all'): T[] {
    return cacheManager.get<T[]>(`${this.cachePrefix}list:${listKey}`) || [];
  }
  
  /**
   * Stocke une entité avec son ID
   */
  setById(id: string, entity: T, ttl?: number): void {
    cacheManager.set(`${this.cachePrefix}${id}`, entity, ttl);
  }
  
  /**
   * Stocke une liste d'entités
   */
  setList(entities: T[], listKey: string = 'all', ttl?: number): void {
    cacheManager.set(`${this.cachePrefix}list:${listKey}`, entities, ttl);
  }
  
  /**
   * Supprime une entité par ID
   */
  removeById(id: string): void {
    cacheManager.invalidate(`${this.cachePrefix}${id}`);
  }
  
  /**
   * Supprime une liste d'entités
   */
  removeList(listKey: string = 'all'): void {
    cacheManager.invalidate(`${this.cachePrefix}list:${listKey}`);
  }
  
  /**
   * Invalide tout le cache pour ce type d'entité
   */
  invalidateAll(): number {
    return cacheManager.invalidateByPrefix(this.cachePrefix);
  }
}

// Instancier les caches pour les différentes entités
export const projectsCache = new EntityCache('projects');
export const auditsCache = new EntityCache('audits');
export const pagesCache = new EntityCache('pages');
export const checklistsCache = new EntityCache('checklists');
export const exigencesCache = new EntityCache('exigences');
export const evaluationsCache = new EntityCache('evaluations');
export const actionsCache = new EntityCache('actions');
