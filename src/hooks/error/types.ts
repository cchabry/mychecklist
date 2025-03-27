
import { AppError } from '@/types/error';

/**
 * Options pour la configuration du comportement du gestionnaire d'erreurs
 */
export interface ErrorHandlerOptions {
  /** Afficher un toast pour informer l'utilisateur */
  showToast?: boolean;
  /** Titre optionnel pour le toast d'erreur */
  toastTitle?: string;
  /** Description optionnelle pour le toast d'erreur */
  toastDescription?: string;
  /** Logger l'erreur dans la console */
  logToConsole?: boolean;
  /** Callback exécuté après le traitement de l'erreur */
  onError?: (error: AppError) => void;
}
