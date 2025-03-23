
import { operationMode } from '@/services/operationMode';
import { mockData } from '@/lib/mockData/index';

/**
 * Gère le mode opérationnel (démo ou réel) pour les appels de service
 * @param realFn Fonction à exécuter en mode réel
 * @param demoFn Fonction à exécuter en mode démo
 * @returns Résultat de la fonction appropriée
 */
export async function handleDemoMode<T>(
  realFn: () => Promise<T>,
  demoFn: () => Promise<T>
): Promise<T> {
  try {
    // Si on est en mode démo, on exécute la fonction de démo
    if (operationMode.isDemoMode) {
      console.log('[baseService] Exécution en mode démo');
      return await demoFn();
    }
    
    // Sinon, on exécute la fonction réelle
    console.log('[baseService] Exécution en mode réel');
    const result = await realFn();
    
    // Signaler au service de mode opérationnel que l'opération a réussi
    operationMode.handleSuccessfulOperation();
    
    return result;
  } catch (error) {
    console.error('[baseService] Erreur lors de l\'exécution:', error);
    
    // Signaler l'erreur au service de mode opérationnel
    if (error instanceof Error) {
      operationMode.handleConnectionError(error, 'API Service');
    } else {
      operationMode.handleConnectionError(new Error(String(error)), 'API Service');
    }
    
    // Si on a basculé en mode démo après l'erreur, on essaie avec la fonction de démo
    if (operationMode.isDemoMode) {
      console.log('[baseService] Basculement vers le mode démo après erreur');
      return await demoFn();
    }
    
    // Sinon, on propage l'erreur
    throw error;
  }
}

// Exporter le service mockData pour faciliter l'accès à travers l'application
export { mockData };
