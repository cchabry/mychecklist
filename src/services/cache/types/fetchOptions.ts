
/**
 * Options pour les opérations de récupération via le cache
 */
export interface CacheFetchOptions<T> {
  /**
   * Fonction à exécuter si le cache est absent ou expiré
   */
  fetcher: () => Promise<T>;
  
  /**
   * Temps de vie spécifique pour cette entrée
   */
  ttl?: number;
  
  /**
   * Si true, le cache sera ignoré et une nouvelle requête sera effectuée
   */
  skipCache?: boolean;
  
  /**
   * Si true, le cache sera utilisé même s'il est expiré, 
   * mais sera rafraîchi en arrière-plan (stale-while-revalidate)
   */
  staleWhileRevalidate?: boolean;
  
  /**
   * Temps en millisecondes pendant lequel les données sont considérées fraîches
   * Utilisé avec staleWhileRevalidate pour décider quand rafraîchir
   */
  staleTime?: number;
  
  /**
   * Callbacks d'événements
   */
  onSuccess?: (data: T, fromCache: boolean) => void;
  onError?: (error: Error) => void;
  onLoading?: (isLoading: boolean) => void;
}
