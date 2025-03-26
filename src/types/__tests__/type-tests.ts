
/**
 * Ce fichier contient des tests de type pour vérifier que nos interfaces principales
 * sont correctement définies et utilisées.
 * 
 * Ces tests ne sont pas exécutés à l'exécution, mais sont vérifiés par le compilateur TypeScript.
 * Si le fichier compile sans erreur, alors les tests passent.
 */

import { 
  Project, 
  Audit, 
  ChecklistItem, 
  Exigence, 
  SamplePage,
  Evaluation,
  CorrectiveAction,
  ActionProgress 
} from '../domain';

import {
  ImportanceLevel,
  ComplianceLevel,
  PriorityLevel,
  StatusType
} from '../enums';

// Fonction helper pour tester qu'un type est assignable à un autre
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T, U extends T>() {}

/**
 * Test pour l'interface Project
 */
export function testProject() {
  // Test de création d'un projet valide
  const validProject: Project = {
    id: '123',
    name: 'Projet test',
    description: 'Description du projet',
    url: 'https://example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  // Vérification que l'objet est bien de type Project
  assertType<Project, typeof validProject>();
  
  // Test des propriétés requises (erreur de compilation si manquante)
  // @ts-expect-error: id est requis
  const missingId: Project = {
    name: 'Projet test',
    description: 'Description du projet',
    url: 'https://example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  // @ts-expect-error: name est requis
  const missingName: Project = {
    id: '123',
    description: 'Description du projet',
    url: 'https://example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  return { validProject, missingId, missingName };
}

/**
 * Test pour l'interface Audit
 */
export function testAudit() {
  // Test de création d'un audit valide
  const validAudit: Audit = {
    id: '123',
    projectId: '456',
    name: 'Audit test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  // Ajout de propriétés optionnelles
  const fullAudit: Audit = {
    ...validAudit,
    description: 'Description détaillée',
    version: '1.0',
    itemsCount: 42
  };
  
  // Vérification que les objets sont bien de type Audit
  assertType<Audit, typeof validAudit>();
  assertType<Audit, typeof fullAudit>();
  
  // Test des propriétés requises
  // @ts-expect-error: projectId est requis
  const missingProjectId: Audit = {
    id: '123',
    name: 'Audit test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  return { validAudit, fullAudit, missingProjectId };
}

/**
 * Test pour l'interface ChecklistItem
 */
export function testChecklistItem() {
  // Test de création d'un item de checklist valide
  const validChecklistItem: ChecklistItem = {
    id: '123',
    consigne: 'Respecter la charte graphique',
    description: 'Tous les éléments doivent suivre la charte graphique définie',
    category: 'Design',
    subcategory: 'Charte graphique',
    reference: ['RGAA 1.1', 'OPQUAST 42'],
    profil: ['UI designer', 'Développeur'],
    phase: ['Design', 'Développement'],
    effort: 3,
    priority: 4
  };
  
  // Vérification que l'objet est bien de type ChecklistItem
  assertType<ChecklistItem, typeof validChecklistItem>();
  
  // Test des tableaux vides (doivent être valides)
  const minimalArrays: ChecklistItem = {
    ...validChecklistItem,
    reference: [],
    profil: [],
    phase: []
  };
  
  assertType<ChecklistItem, typeof minimalArrays>();
  
  return { validChecklistItem, minimalArrays };
}

/**
 * Test pour l'interface Exigence
 */
export function testExigence() {
  // Test de création d'une exigence valide
  const validExigence: Exigence = {
    id: '123',
    projectId: '456',
    itemId: '789',
    importance: ImportanceLevel.Important
  };
  
  // Avec commentaire optionnel
  const withComment: Exigence = {
    ...validExigence,
    comment: 'Ce point est particulièrement important pour ce projet'
  };
  
  // Vérification que les objets sont bien de type Exigence
  assertType<Exigence, typeof validExigence>();
  assertType<Exigence, typeof withComment>();
  
  // Test des valeurs d'énumération
  const allImportanceLevels: ImportanceLevel[] = [
    ImportanceLevel.NotApplicable,
    ImportanceLevel.Minor,
    ImportanceLevel.Medium,
    ImportanceLevel.Important,
    ImportanceLevel.Major
  ];
  
  // Vérifier que chaque niveau d'importance peut être utilisé
  allImportanceLevels.forEach(level => {
    const exigence: Exigence = {
      ...validExigence,
      importance: level
    };
    assertType<Exigence, typeof exigence>();
  });
  
  return { validExigence, withComment };
}

/**
 * Test pour l'interface SamplePage
 */
export function testSamplePage() {
  // Test de création d'une page d'échantillon valide
  const validSamplePage: SamplePage = {
    id: '123',
    projectId: '456',
    url: 'https://example.com/page',
    title: 'Page d\'accueil',
    order: 1
  };
  
  // Avec description optionnelle
  const withDescription: SamplePage = {
    ...validSamplePage,
    description: 'Page principale du site'
  };
  
  // Vérification que les objets sont bien de type SamplePage
  assertType<SamplePage, typeof validSamplePage>();
  assertType<SamplePage, typeof withDescription>();
  
  return { validSamplePage, withDescription };
}

/**
 * Test pour l'interface Evaluation
 */
export function testEvaluation() {
  // Test de création d'une évaluation valide
  const validEvaluation: Evaluation = {
    id: '123',
    auditId: '456',
    pageId: '789',
    exigenceId: '012',
    score: ComplianceLevel.Compliant,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Avec propriétés optionnelles
  const fullEvaluation: Evaluation = {
    ...validEvaluation,
    comment: 'La page respecte bien cette exigence',
    attachments: ['screenshot1.png', 'evidence.pdf']
  };
  
  // Vérification que les objets sont bien de type Evaluation
  assertType<Evaluation, typeof validEvaluation>();
  assertType<Evaluation, typeof fullEvaluation>();
  
  // Test des valeurs d'énumération
  const allComplianceLevels: ComplianceLevel[] = [
    ComplianceLevel.Compliant,
    ComplianceLevel.PartiallyCompliant,
    ComplianceLevel.NonCompliant,
    ComplianceLevel.NotApplicable
  ];
  
  // Vérifier que chaque niveau de conformité peut être utilisé
  allComplianceLevels.forEach(level => {
    const evaluation: Evaluation = {
      ...validEvaluation,
      score: level
    };
    assertType<Evaluation, typeof evaluation>();
  });
  
  return { validEvaluation, fullEvaluation };
}

/**
 * Test pour l'interface CorrectiveAction
 */
export function testCorrectiveAction() {
  // Test de création d'une action corrective valide
  const validAction: CorrectiveAction = {
    id: '123',
    evaluationId: '456',
    targetScore: ComplianceLevel.Compliant,
    priority: PriorityLevel.High,
    dueDate: new Date().toISOString(),
    responsible: 'Jean Dupont',
    status: StatusType.Todo
  };
  
  // Avec commentaire optionnel
  const withComment: CorrectiveAction = {
    ...validAction,
    comment: 'Modifier la structure HTML pour respecter les standards RGAA'
  };
  
  // Vérification que les objets sont bien de type CorrectiveAction
  assertType<CorrectiveAction, typeof validAction>();
  assertType<CorrectiveAction, typeof withComment>();
  
  // Test des valeurs d'énumération pour les priorités
  const allPriorityLevels: PriorityLevel[] = [
    PriorityLevel.Low,
    PriorityLevel.Medium,
    PriorityLevel.High,
    PriorityLevel.Critical
  ];
  
  // Test des valeurs d'énumération pour les statuts
  const allStatusTypes: StatusType[] = [
    StatusType.Todo,
    StatusType.InProgress,
    StatusType.Done
  ];
  
  // Vérifier les combinaisons possibles
  allPriorityLevels.forEach(priority => {
    allStatusTypes.forEach(status => {
      const action: CorrectiveAction = {
        ...validAction,
        priority,
        status
      };
      assertType<CorrectiveAction, typeof action>();
    });
  });
  
  return { validAction, withComment };
}

/**
 * Test pour l'interface ActionProgress
 */
export function testActionProgress() {
  // Test de création d'un suivi de progrès valide
  const validProgress: ActionProgress = {
    id: '123',
    actionId: '456',
    date: new Date().toISOString(),
    responsible: 'Marie Martin',
    score: ComplianceLevel.PartiallyCompliant,
    status: StatusType.InProgress
  };
  
  // Avec commentaire optionnel
  const withComment: ActionProgress = {
    ...validProgress,
    comment: 'Modifications partiellement implémentées, en attente de validation'
  };
  
  // Vérification que les objets sont bien de type ActionProgress
  assertType<ActionProgress, typeof validProgress>();
  assertType<ActionProgress, typeof withComment>();
  
  return { validProgress, withComment };
}

/**
 * Tests des relations entre types
 */
export function testTypeRelations() {
  // Créer des objets valides pour tester les relations
  const project: Project = {
    id: 'p1',
    name: 'Projet test',
    description: 'Description du projet',
    url: 'https://example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  const checklistItem: ChecklistItem = {
    id: 'ci1',
    consigne: 'Consigne test',
    description: 'Description de la consigne',
    category: 'Catégorie',
    subcategory: 'Sous-catégorie',
    reference: ['Ref1'],
    profil: ['Profil1'],
    phase: ['Phase1'],
    effort: 2,
    priority: 3
  };
  
  const exigence: Exigence = {
    id: 'e1',
    projectId: project.id, // Référence au projet
    itemId: checklistItem.id, // Référence à l'item de checklist
    importance: ImportanceLevel.Important
  };
  
  const samplePage: SamplePage = {
    id: 'sp1',
    projectId: project.id, // Référence au projet
    url: 'https://example.com/page1',
    title: 'Page 1',
    order: 1
  };
  
  const audit: Audit = {
    id: 'a1',
    projectId: project.id, // Référence au projet
    name: 'Audit 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };
  
  const evaluation: Evaluation = {
    id: 'ev1',
    auditId: audit.id, // Référence à l'audit
    pageId: samplePage.id, // Référence à la page
    exigenceId: exigence.id, // Référence à l'exigence
    score: ComplianceLevel.PartiallyCompliant,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const action: CorrectiveAction = {
    id: 'ac1',
    evaluationId: evaluation.id, // Référence à l'évaluation
    targetScore: ComplianceLevel.Compliant,
    priority: PriorityLevel.Medium,
    dueDate: new Date().toISOString(),
    responsible: 'Responsable',
    status: StatusType.Todo
  };
  
  const progress: ActionProgress = {
    id: 'ap1',
    actionId: action.id, // Référence à l'action
    date: new Date().toISOString(),
    responsible: 'Responsable progrès',
    score: ComplianceLevel.PartiallyCompliant,
    status: StatusType.InProgress
  };
  
  // Vérifier que tous les objets sont correctement typés
  assertType<Project, typeof project>();
  assertType<ChecklistItem, typeof checklistItem>();
  assertType<Exigence, typeof exigence>();
  assertType<SamplePage, typeof samplePage>();
  assertType<Audit, typeof audit>();
  assertType<Evaluation, typeof evaluation>();
  assertType<CorrectiveAction, typeof action>();
  assertType<ActionProgress, typeof progress>();
  
  return {
    project,
    checklistItem,
    exigence,
    samplePage,
    audit,
    evaluation,
    action,
    progress
  };
}

// Tester l'API Notion
import { 
  NotionAPI, 
  NotionAPIOptions, 
  NotionAPIResponse, 
  ConnectionStatus 
} from '../api/notionApi';

/**
 * Test de l'interface NotionAPI et des options associées
 */
export function testNotionAPI() {
  // Test des options de l'API Notion
  const validOptions: NotionAPIOptions = {
    apiKey: 'secret_key',
    projectsDbId: 'db1',
    checklistsDbId: 'db2',
    mockMode: false,
    debug: true
  };
  
  // Test de réponse de l'API Notion
  const successResponse: NotionAPIResponse<Project> = {
    success: true,
    data: {
      id: 'p1',
      name: 'Projet depuis Notion',
      description: 'Description',
      url: 'https://example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 50
    }
  };
  
  const errorResponse: NotionAPIResponse = {
    success: false,
    error: {
      message: 'Erreur d\'accès à l\'API Notion',
      code: 'API_ERROR',
      status: 500
    }
  };
  
  // Test des statuts de connexion
  const statuses: ConnectionStatus[] = [
    ConnectionStatus.Connected,
    ConnectionStatus.Disconnected,
    ConnectionStatus.Error,
    ConnectionStatus.Loading
  ];
  
  // Ces vérifications vont échouer à la compilation si les types ne sont pas corrects
  assertType<NotionAPIOptions, typeof validOptions>();
  assertType<NotionAPIResponse<Project>, typeof successResponse>();
  assertType<NotionAPIResponse, typeof errorResponse>();
  
  return { validOptions, successResponse, errorResponse, statuses };
}
