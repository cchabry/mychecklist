
/**
 * Simulateur de router pour la compatibilité avec next/router
 */

export interface Router {
  query: Record<string, string | string[] | undefined>;
  push: (path: string) => Promise<boolean>;
}

export function useRouter(): Router {
  // Extraire le projectId de l'URL
  const getProjectIdFromUrl = (): string => {
    // Récupérer le chemin actuel
    const path = window.location.pathname;
    
    // Si le chemin est de la forme /project/edit/[id]
    const matches = path.match(/\/project\/edit\/([^\/]+)/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // Sinon essayer avec les paramètres d'URL
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projectId');
    if (projectId) {
      return projectId;
    }
    
    return 'mock-id';
  };
  
  return {
    query: { 
      projectId: getProjectIdFromUrl() 
    },
    push: async (path: string) => {
      // Simuler une navigation avec l'historique du navigateur
      window.history.pushState(null, '', path);
      // Émettre un événement de navigation
      window.dispatchEvent(new Event('popstate'));
      return true;
    }
  };
}

export default useRouter;
