
import { useNotionError } from './useNotionError';

/**
 * Hook maintenu pour la compatibilité avec le code existant
 * Utilise le nouveau useNotionError en interne
 * @deprecated Utilisez useNotionError directement
 */
export function useNotionErrorState() {
  const {
    errorDetails,
    showError,
    clearError,
    openErrorModal,
    closeErrorModal,
    showErrorModal
  } = useNotionError();
  
  return {
    notionErrorDetails: errorDetails,
    showErrorDetails: showErrorModal,
    setShowErrorDetails: (show: boolean) => show ? openErrorModal() : closeErrorModal(),
    hideNotionError: clearError
  };
}
