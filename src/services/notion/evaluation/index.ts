
/**
 * Module d'évaluation
 * 
 * Ce module centralise tous les services, utilitaires et types liés aux évaluations.
 * Il facilite l'accès aux fonctionnalités d'évaluation depuis d'autres parties de l'application.
 */

// Exporter le service principal d'évaluation
export { evaluationService } from './evaluationService';

// Exporter l'implémentation standardisée
export { evaluationServiceImpl } from './EvaluationServiceImpl';

// Exporter les utilitaires pour la génération et manipulation des évaluations
export * from './utils';

// Exporter les types spécifiques aux évaluations
export * from './types';
