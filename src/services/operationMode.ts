
/**
 * Service pour gérer le mode d'opération de l'application
 */

class OperationModeService {
  isDemoMode: boolean;
  
  constructor() {
    // Vérifier le localStorage pour voir si le mode démo est activé
    this.isDemoMode = localStorage.getItem('notion_mock_mode') === 'true';
  }
  
  /**
   * Active le mode démo
   */
  enableDemoMode(reason: string = 'Non spécifié'): void {
    this.isDemoMode = true;
    localStorage.setItem('notion_mock_mode', 'true');
    console.info(`Mode démo activé. Raison: ${reason}`);
  }
  
  /**
   * Active le mode réel
   */
  enableRealMode(): void {
    this.isDemoMode = false;
    localStorage.setItem('notion_mock_mode', 'false');
    console.info('Mode réel activé.');
  }
  
  /**
   * Bascule entre les modes démo et réel
   */
  toggleMode(): void {
    if (this.isDemoMode) {
      this.enableRealMode();
    } else {
      this.enableDemoMode('Basculement manuel');
    }
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeService();
