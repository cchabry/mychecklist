
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
  | 'project'
  | 'projectExigences'
  | 'projectAudits'
  | 'projectActions'
  | 'projectCreate'
  | 'projectEdit'
  | 'config'
  | 'configChecklist';

/**
 * Structure des routes de l'application
 */
export interface AppRoutes {
  [key: string]: Route | RouteWithChildren;
}
