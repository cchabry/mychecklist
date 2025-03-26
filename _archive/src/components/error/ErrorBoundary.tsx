
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw, FileWarning } from 'lucide-react';
import { useErrorHandling, ErrorDetails } from '@/hooks/useErrorHandling';
import { useRecoveryStrategies } from '@/hooks/useRecoveryStrategies';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorDetails: ErrorDetails) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Composant ErrorFallback utilisé pour afficher une erreur de rendu
 */
const ErrorFallback: React.FC<{ 
  error: Error; 
  resetError: () => void; 
  errorDetails?: ErrorDetails;
}> = ({ error, resetError, errorDetails }) => {
  const { getRecoveryStrategyForCategory } = useRecoveryStrategies();
  
  const category = errorDetails?.category || 'unknown';
  const { primary, secondary, description } = getRecoveryStrategyForCategory(category);
  
  const handlePrimaryAction = () => {
    primary();
    resetError();
  };
  
  const handleSecondaryAction = () => {
    secondary();
    resetError();
  };
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
            <div>
              <CardTitle>Une erreur s'est produite</CardTitle>
              <CardDescription>{description || 'L\'application a rencontré un problème inattendu'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-sm font-mono text-slate-700 break-words">
              {error.message}
            </p>
          </div>
          {errorDetails?.context && (
            <p className="text-sm text-muted-foreground">
              Contexte: {errorDetails.context}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
            <FileWarning className="h-4 w-4" />
            <p>
              Vous pouvez essayer de résoudre ce problème ou revenir à l'accueil.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleSecondaryAction}
          >
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
          <Button 
            onClick={handlePrimaryAction}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

/**
 * Composant de frontière d'erreur pour capturer les erreurs de rendu
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Accéder au hook useErrorHandling via un wrapper
    const ErrorHandlingWrapper = () => {
      const { handleError } = useErrorHandling();
      const errorDetails = handleError(error, 'Erreur de rendu React', {
        showToast: false
      });
      
      if (this.props.onError) {
        this.props.onError(error, errorInfo, errorDetails);
      }
      
      return null;
    };
    
    // Rendu temporaire pour accéder au hook
    const tempDiv = document.createElement('div');
    const root = document.getElementById('root');
    if (root) {
      root.appendChild(tempDiv);
      
      // Utiliser ReactDOM.render nécessite une importation et configuration supplémentaire
      // En pratique, utilisez createRoot ou une autre méthode pour rendre ce composant temporairement
      
      // Après usage, nettoyer
      root.removeChild(tempDiv);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Créer un wrapper pour accéder aux hooks dans un composant de classe
      const FallbackWithHooks = () => {
        const { lastError } = useErrorHandling();
        
        return (
          <ErrorFallback 
            error={this.state.error!} 
            resetError={this.resetError} 
            errorDetails={lastError}
          />
        );
      };
      
      return <FallbackWithHooks />;
    }

    return this.props.children;
  }
}

// Wrapper fonctionnel pour faciliter l'utilisation
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
