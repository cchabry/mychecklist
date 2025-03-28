
/**
 * Ce fichier contient des tests de type pour vérifier que nos interfaces principales
 * sont correctement définies et utilisées.
 * 
 * Il s'agit de tests "statiques" qui sont vérifiés par TypeScript à la compilation,
 * pas de tests d'exécution.
 */

import { 
  Project, 
  ChecklistItem, 
  Exigence, 
  SamplePage,
  Evaluation,
  CorrectiveAction,
  ActionProgress,
  Attachment
} from '../domain';

import {
  ImportanceLevel,
  ComplianceLevel,
  PriorityLevel,
  StatusType
} from '../enums';

// Test de base pour Project
function testProject(project: Project) {
  console.log(project.name);
}

// Test de base pour ChecklistItem
function testChecklistItem(item: ChecklistItem) {
  console.log(item.consigne);
}

// Test de base pour Exigence
function testExigence(exigence: Exigence) {
  console.log(exigence.comment);
}

// Test de base pour SamplePage
function testSamplePage(page: SamplePage) {
  console.log(page.title);
}

// Test de base pour Evaluation
function testEvaluation(evaluation: Evaluation) {
    console.log(evaluation.score);
}

// Test de base pour CorrectiveAction
function testCorrectiveAction(action: CorrectiveAction) {
    console.log(action.comment || action.description);
}

// Test de base pour ActionProgress
function testActionProgress(progress: ActionProgress) {
    console.log(progress.comment);
}

// Test de base pour Attachment
function testAttachment(attachment: Attachment) {
    console.log(attachment.fileName);
}

// Tests pour les enums
function testEnums() {
    let importance: ImportanceLevel = ImportanceLevel.Important;
    let conformity: ComplianceLevel = ComplianceLevel.Compliant;
    let priority: PriorityLevel = PriorityLevel.High;
    let status: StatusType = StatusType.Done;

    console.log(importance, conformity, priority, status);
}

// Exporter les fonctions pour éviter les avertissements de variable non utilisée
export {
  testProject,
  testChecklistItem,
  testExigence,
  testSamplePage,
  testEvaluation,
  testCorrectiveAction,
  testActionProgress,
  testAttachment,
  testEnums
};
