
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
    
    const settings = operationMode.getSettings();
    const delay = settings.simulatedNetworkDelay || 300;
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
  
  /**
   * Vérifie s'il faut simuler une erreur en fonction du taux configuré
   */
  shouldSimulateError(): boolean {
    if (!operationMode.isDemoMode) return false;
    
    const settings = operationMode.getSettings();
    const errorRate = settings.errorSimulationRate || 0;
    
    if (errorRate <= 0) return false;
    
    // Générer un nombre aléatoire entre 0 et 100
    const random = Math.random() * 100;
    return random < errorRate;
  },
  
  /**
   * Simule une erreur de connexion
   */
  simulateConnectionError(): never {
    const errorMessages = [
      "Erreur réseau simulée: impossible de se connecter au serveur",
      "Temps d'attente dépassé pour la requête simulée",
      "Erreur d'authentification simulée: accès refusé",
      "Erreur de serveur simulée: service temporairement indisponible",
      "Erreur de quota API simulée: limite de requêtes atteinte"
    ];
    
    // Choisir un message d'erreur aléatoire
    const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    throw new Error(`[ERREUR SIMULÉE] ${errorMessage}`);
  },
  
  /**
   * Récupère un scénario de démonstration pour un contexte donné
   * (pour la compatibilité avec l'ancien système)
   */
  getScenario(context: string): any {
    return {
      context,
      isDemo: true,
      data: {
        message: "Données de démonstration générées pour " + context
      }
    };
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
   */
  shouldSuggestDemoMode(currentFailures: number): boolean {
    // Si on a déjà plusieurs échecs mais pas assez pour un basculement automatique
    const settings = operationMode.getSettings();
    const threshold = settings.maxConsecutiveFailures - 1;
    
    return currentFailures >= 2 && currentFailures === threshold;
  },
  
  /**
   * Suggère d'activer le mode démo après des erreurs répétées
   */
  suggestDemoMode(): void {
    toast.info('Problèmes de connexion détectés', {
      description: 'Souhaitez-vous activer le mode démonstration?',
      action: {
        label: 'Activer',
        onClick: () => operationMode.enableDemoMode('Activé suite à une suggestion')
      },
      duration: 8000
    });
  }
};
