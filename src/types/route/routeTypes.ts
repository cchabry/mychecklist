
/**
 * Types pour le système de routage
 */

/**
 * Structure d'une route
 */
export interface Route {
  path: string;
  name: string;
  element: React.ReactNode;
}

/**
 * Structure d'une route avec enfants
 */
export interface RouteWithChildren extends Route {
  children?: Route[];
}

/**
 * Clés des routes principales de l'application
 */
export type AppRouteKey = 
  | 'dashboard'
  | 'projects'
  | 'projectDetails'
  | 'projectCreate'
  | 'projectEdit'
  | 'samplePages'
  | 'exigences'
  | 'checklist'
  | 'audit'
  | 'auditNew'
  | 'actions'
  | 'config';
