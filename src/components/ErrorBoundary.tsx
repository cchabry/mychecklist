
/**
 * Composant pour capturer les erreurs React et les afficher proprement
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from './ui/error-display';
import { AppError, ErrorType } from '@/types/error';
import { Button } from './ui/button';

interface Props {
  /** Contenu à envelopper */
  children: ReactNode;
  /** Message d'erreur par défaut */
  fallbackMessage?: string;
  /** Action à effectuer lors de la récupération */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

/**
 * Composant pour capturer les erreurs React et les afficher proprement
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour afficher le contenu de secours
    return {
      hasError: true,
      error: {
        type: ErrorType.UNKNOWN,
        message: error.message || 'Une erreur est survenue',
        technicalMessage: error.stack
      }
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Enregistrer l'erreur dans un service de rapport d'erreurs
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    const { children, fallbackMessage } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      // Contenu de secours en cas d'erreur
      return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <ErrorDisplay 
            error={error || fallbackMessage || "Une erreur inattendue s'est produite."} 
            showDetails={process.env.NODE_ENV === 'development'}
          />
          <Button 
            onClick={this.handleReset}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
