
export { default as ErrorHeader } from './ErrorHeader';
export { default as ErrorDiagnostics } from './ErrorDiagnostics';
export { default as ErrorActions } from './ErrorActions';

// Exporter une interface commune pour les types d'erreur
export interface NotionErrorDisplayProps {
  error: string;
  context?: string;
}
