
/**
 * Composant pour afficher les erreurs de manière standardisée
 */

import React from 'react';
import { XCircle, AlertTriangle, Info } from 'lucide-react';
import { AppError, ErrorType } from '@/types/error';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ErrorDisplayProps {
  /** Erreur à afficher */
  error: AppError | string | null;
  /** Action à effectuer lorsque l'utilisateur ferme l'erreur */
  onClose?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
  /** Variante d'affichage */
  variant?: 'block' | 'inline' | 'toast';
  /** Afficher les détails techniques (pour les développeurs) */
  showDetails?: boolean;
}

/**
 * Composant pour afficher les erreurs de manière standardisée
 */
export function ErrorDisplay({
  error,
  onClose,
  className,
  variant = 'block',
  showDetails = false
}: ErrorDisplayProps) {
  // Si pas d'erreur, ne rien afficher
  if (!error) return null;
  
  // Convertir l'erreur en AppError si c'est une chaîne
  const appError: AppError = typeof error === 'string' 
    ? { type: ErrorType.UNKNOWN, message: error }
    : error;
  
  // Déterminer l'icône et les classes en fonction du type d'erreur
  let Icon;
  let bgColorClass = '';
  let borderColorClass = '';
  let textColorClass = '';
  
  switch (appError.type) {
    case ErrorType.AUTH:
    case ErrorType.VALIDATION:
      Icon = AlertTriangle;
      bgColorClass = 'bg-amber-50';
      borderColorClass = 'border-amber-300';
      textColorClass = 'text-amber-800';
      break;
    case ErrorType.NETWORK:
    case ErrorType.NOTION:
    case ErrorType.SERVER:
      Icon = XCircle;
      bgColorClass = 'bg-red-50';
      borderColorClass = 'border-red-300';
      textColorClass = 'text-red-800';
      break;
    case ErrorType.UNKNOWN:
    default:
      Icon = Info;
      bgColorClass = 'bg-blue-50';
      borderColorClass = 'border-blue-300';
      textColorClass = 'text-blue-800';
      break;
  }
  
  // Styles différents selon la variante
  const containerStyles = {
    block: `p-4 rounded-md border ${bgColorClass} ${borderColorClass}`,
    inline: `py-1 px-2 rounded-sm text-sm ${textColorClass}`,
    toast: `flex items-center p-3 rounded-md ${bgColorClass} ${textColorClass}`
  };
  
  return (
    <div className={cn(containerStyles[variant], className)}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", textColorClass)} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={cn("text-sm font-medium", textColorClass)}>
            {appError.message}
          </h3>
          
          {showDetails && appError.technicalMessage && (
            <div className="mt-2 text-sm opacity-70 font-mono text-xs">
              <pre className="whitespace-pre-wrap">
                {appError.technicalMessage}
              </pre>
            </div>
          )}
        </div>
        
        {onClose && (
          <div className="ml-auto pl-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("p-1 h-auto", textColorClass)} 
              onClick={onClose}
            >
              <span className="sr-only">Fermer</span>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
