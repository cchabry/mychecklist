
// Export des services d'API
export * from './types';
export * from './baseService';
export * from './projectsService';
export * from './auditsService';
export * from './checklistService';
export * from './exigencesService';
export * from './pagesService';
export * from './evaluationsService';
export * from './actionsService';

// Export d'un objet contenant tous les services pour un accès facile
import { projectsService } from './projectsService';
import { auditsService } from './auditsService';
import { checklistService } from './checklistService';
import { exigencesService } from './exigencesService';
import { pagesService } from './pagesService';
import { evaluationsService } from './evaluationsService';
import { actionsService } from './actionsService';

/**
 * Services d'API centralisés
 */
export const apiServices = {
  projects: projectsService,
  audits: auditsService,
  checklist: checklistService,
  exigences: exigencesService,
  pages: pagesService,
  evaluations: evaluationsService,
  actions: actionsService
};

// Export par défaut pour un accès simplifié
export default apiServices;
