
/**
 * @deprecated Ce module est déprécié. Utilisez `operationMode` à la place.
 * Module de compatibilité temporaire pour faciliter la migration.
 */

import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

// Afficher un avertissement une seule fois
let warningShown = false;
const showDeprecationWarning = () => {
  if (!warningShown) {
    console.warn(
      "[DÉPRÉCIÉ] Le module mockMode est déprécié et sera supprimé dans une version future. " +
      "Veuillez utiliser operationMode à la place."
    );
    warningShown = true;
  }
};

// Créer un objet de compatibilité qui redirige toutes les méthodes vers operationMode
export const mockMode = {
  isActive: () => {
    showDeprecationWarning();
    return operationMode.isDemoMode;
  },
  
  activate: () => {
    showDeprecationWarning();
    toast.warning('Utilisation d\'une API dépréciée', { 
      description: 'mockMode.activate() est déprécié. Utilisez operationMode.enableDemoMode() à la place.'
    });
    operationMode.enableDemoMode('Activation via API dépréciée mockMode');
  },
  
  deactivate: () => {
    showDeprecationWarning();
    toast.warning('Utilisation d\'une API dépréciée', { 
      description: 'mockMode.deactivate() est déprécié. Utilisez operationMode.enableRealMode() à la place.'
    });
    operationMode.enableRealMode();
  },
  
  toggle: () => {
    showDeprecationWarning();
    toast.warning('Utilisation d\'une API dépréciée', { 
      description: 'mockMode.toggle() est déprécié. Utilisez operationMode.toggle() à la place.'
    });
    operationMode.toggle();
    return operationMode.isDemoMode;
  },
  
  // Autres méthodes pour maintenir la compatibilité
  isPermanent: () => false,
  setPermanent: () => {
    showDeprecationWarning();
    console.warn("setPermanent est déprécié et n'a plus d'effet");
  },
  getDelay: () => 500,
  setDelay: () => {
    showDeprecationWarning();
    console.warn("setDelay est déprécié et n'a plus d'effet");
  },
  getScenario: () => 'default',
  setScenario: () => {
    showDeprecationWarning();
    console.warn("setScenario est déprécié et n'a plus d'effet");
  },
  getErrorRate: () => 5,
  setErrorRate: () => {
    showDeprecationWarning();
    console.warn("setErrorRate est déprécié et n'a plus d'effet");
  },
  getMockResponse: () => {
    showDeprecationWarning();
    console.warn("getMockResponse est déprécié");
    return {};
  }
};

// Documentation pour la migration
console.warn(
  "IMPORTANT: Le module mockMode est maintenu temporairement pour la compatibilité, " +
  "mais sera supprimé. Veuillez mettre à jour votre code pour utiliser operationMode."
);
