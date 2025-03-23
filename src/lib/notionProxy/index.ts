
import { notionApiRequest } from './proxyFetch';
import * as users from './endpoints/users';
import * as databases from './endpoints/databases';
import * as pages from './endpoints/pages';
import * as projects from './endpoints/projects';
import * as audits from './endpoints/audits';
import * as exigences from './endpoints/exigences';
import * as checklist from './endpoints/checklist';
import * as samplePages from './endpoints/samplePages';
import * as evaluations from './endpoints/evaluations';
import * as actions from './endpoints/actions';
import { operationMode } from '@/services/operationMode';

// Exporter toutes les API de Notion depuis un point d'entrée unique
export const notionApi = {
  // Point d'accès principal pour les requêtes personnalisées
  request: notionApiRequest,
  
  // Points d'accès organisés par entité
  users,
  databases,
  pages,
  
  // Nouveau système de mode opérationnel
  operationMode,
  
  // Méthodes de haut niveau pour les projets
  getProjects: projects.getProjects,
  getProject: projects.getProject,
  createProject: projects.createProject,
  updateProject: projects.updateProject,
  deleteProject: projects.deleteProject,
  
  // Méthodes pour les audits
  getAudits: audits.getAudits,
  getAudit: audits.getAudit,
  createAudit: audits.createAudit,
  updateAudit: audits.updateAudit,
  deleteAudit: audits.deleteAudit,
  
  // Méthodes pour les exigences
  getExigences: exigences.getExigences,
  getExigence: exigences.getExigence,
  createExigence: exigences.createExigence,
  updateExigence: exigences.updateExigence,
  deleteExigence: exigences.deleteExigence,
  
  // Méthodes pour les items de checklist
  getChecklistItems: checklist.getChecklistItems,
  getChecklistItem: checklist.getChecklistItem,
  createChecklistItem: checklist.createChecklistItem,
  updateChecklistItem: checklist.updateChecklistItem,
  deleteChecklistItem: checklist.deleteChecklistItem,
  
  // Méthodes pour les pages d'échantillon
  getSamplePages: samplePages.getSamplePages,
  getSamplePage: samplePages.getSamplePage,
  createSamplePage: samplePages.createSamplePage,
  updateSamplePage: samplePages.updateSamplePage,
  deleteSamplePage: samplePages.deleteSamplePage,
  
  // Méthodes pour les évaluations
  getEvaluations: evaluations.getEvaluations,
  getEvaluation: evaluations.getEvaluation,
  getEvaluationsByAuditId: evaluations.getEvaluationsByAuditId,
  createEvaluation: evaluations.createEvaluation,
  updateEvaluation: evaluations.updateEvaluation,
  deleteEvaluation: evaluations.deleteEvaluation,
  
  // Méthodes pour les actions correctives
  getActions: actions.getActions,
  getAction: actions.getAction,
  getActionsByEvaluationId: actions.getActionsByEvaluationId,
  createAction: actions.createAction,
  updateAction: actions.updateAction,
  deleteAction: actions.deleteAction
};

// Réexporter la fonction principale pour la rétrocompatibilité
export { notionApiRequest };
