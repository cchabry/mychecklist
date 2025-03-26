
/**
 * Classe d'abstraction pour la gestion du stockage de cache
 */

import { CacheEntry } from '../../types/cacheEntry';

/**
 * Gère le stockage des entrées de cache avec une interface simplifiée
 */
export class CacheStorage {
  private storage: Map<string, CacheEntry<any>>;

  constructor() {
    this.storage = new Map<string, CacheEntry<any>>();
  }

  /**
   * Stocke une entrée dans le cache
   */
  set<T>(key: string, entry: CacheEntry<T>): void {
    this.storage.set(key, entry);
  }

  /**
   * Récupère une entrée du cache
   */
  get<T>(key: string): CacheEntry<T> | undefined {
    return this.storage.get(key) as CacheEntry<T> | undefined;
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Vide entièrement le cache
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Retourne le nombre d'entrées dans le cache
   */
  size(): number {
    return this.storage.size;
  }

  /**
   * Retourne un itérateur sur les entrées du cache
   */
  entries(): IterableIterator<[string, CacheEntry<any>]> {
    return this.storage.entries();
  }

  /**
   * Retourne un itérateur sur les clés du cache
   */
  keys(): IterableIterator<string> {
    return this.storage.keys();
  }

  /**
   * Retourne un itérateur sur les valeurs du cache
   */
  values(): IterableIterator<CacheEntry<any>> {
    return this.storage.values();
  }
}
