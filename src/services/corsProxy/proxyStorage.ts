
/**
 * Utilitaires pour gérer le stockage des données de proxy
 */
export const proxyStorage = {
  /**
   * Charge l'état depuis localStorage
   * @param key Clé de stockage
   * @param onLoad Callback à appeler avec les données chargées
   */
  loadFromStorage(key: string, onLoad: (data: any) => void): void {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const data = JSON.parse(storedData);
        onLoad(data);
      }
    } catch (e) {
      console.error(`Erreur lors du chargement de l'état du proxy depuis localStorage`, e);
    }
  },

  /**
   * Sauvegarde l'état dans localStorage
   * @param key Clé de stockage
   * @param state État à sauvegarder
   */
  saveToStorage(key: string, state: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Erreur lors de la sauvegarde de l'état du proxy dans localStorage`, e);
    }
  }
};
