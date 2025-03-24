
import { toast } from 'sonner';
import { operationMode } from './operationModeService';

/**
 * Utilitaires pour le système operationMode
 */
export const operationModeUtils = {
  /**
   * Applique un délai simulé pour les opérations en mode démo
   */
  async applySimulatedDelay(): Promise<void> {
    if (!operationMode.isDemoMode) return;
    
    // Délai fixe simplifié
    const delay = 300;
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
  
  /**
   * Vérifie s'il faut simuler une erreur en fonction du taux configuré
   */
  shouldSimulateError(): boolean {
    // Désactivé pour éviter les comportements aléatoires
    return false;
  },
  
  /**
   * Simule une erreur de connexion
   */
  simulateConnectionError(): never {
    const errorMessages = [
      "Erreur réseau simulée: impossible de se connecter au serveur"
    ];
    
    // Choisir un message d'erreur aléatoire
    const errorMessage = errorMessages[0];
    
    throw new Error(`[ERREUR SIMULÉE] ${errorMessage}`);
  },
  
  /**
   * Vérifie si une URL doit ignorer le mode démonstration
   */
  shouldBypassDemoMode(url: string): boolean {
    // Liste des URL qui doivent toujours utiliser le mode réel
    const alwaysRealUrls = [
      '/api/health',
      '/api/version',
      '/api/config'
    ];
    
    return alwaysRealUrls.some(pattern => url.includes(pattern));
  },
  
  /**
   * Vérifie si un basculement automatique vers le mode démo est recommandé
   * Désactivé pour éviter le basculement automatique
   */
  shouldSuggestDemoMode(): boolean {
    return false;
  },
  
  /**
   * Suggère d'activer le mode démo après des erreurs répétées
   * Simplifié pour ne pas suggérer automatiquement
   */
  suggestDemoMode(): void {
    // Ne suggère plus automatiquement
  }
};
