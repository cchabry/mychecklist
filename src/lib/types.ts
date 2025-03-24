
/**
 * Shared utility functions
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * This is a utility function for combining Tailwind CSS classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 
 * Project representation
 */
export interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  itemsCount: number;
  pagesCount: number;
  samplePages?: SamplePage[];
}

/**
 * Sample Page in a project
 */
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description: string;
  order: number;
}

/**
 * Checklist item (from reference checklist)
 */
export interface ChecklistItem {
  id: string;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  reference: string[];
  profil: string[];
  phase: string[];
  effort: string;
  priority: string;
  title?: string;
  metaRefs?: string;
  profile?: string;
  criteria?: string;
  requirementLevel?: string;
  scope?: string;
  status?: ComplianceStatus;
  comment?: string;
  details?: string;
  pageResults?: PageResult[];
  importance?: ImportanceLevel;
  projectRequirement?: string;
  projectComment?: string;
  actions?: CorrectiveAction[];
}

/**
 * Project-specific exigence based on checklist item
 */
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment: string;
}

/**
 * Audit information
 */
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items?: AuditItem[];
  score?: number;
  version?: string;
  completedAt?: string;
}

/**
 * Audit item (adapted from checklist item)
 */
export interface AuditItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  criteria?: string;
  profile?: string;
  phase?: string;
  effort?: string;
  priority?: string;
  requirementLevel?: string;
  scope?: string;
  consigne: string;
  status: ComplianceStatus;
  pageResults?: PageResult[];
  importance?: ImportanceLevel;
  comment?: string;
  metaRefs?: string;
  profil?: string;
  details?: string;
  actions?: CorrectiveAction[];
  reference?: string;
}

/**
 * Page result for an audit item
 */
export interface PageResult {
  pageId: string;
  status: ComplianceStatus;
  comment?: string;
}

/**
 * Project requirement
 */
export interface ProjectRequirement {
  id: string;
  projectId: string;
  itemId: string;
  level: string;
  details: string;
}

/**
 * Evaluation for a specific page against an exigence
 */
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceStatus;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Corrective action for an evaluation
 */
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment: string;
  status: ActionStatus;
  pageId?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: ActionProgress[];
}

/**
 * Progress update on an action
 */
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceStatus;
  status: ActionStatus;
}

/**
 * Compliance status values
 */
export enum ComplianceStatus {
  Compliant = "Compliant",
  NonCompliant = "NonCompliant",
  PartiallyCompliant = "PartiallyCompliant",
  NotEvaluated = "NotEvaluated",
  NotApplicable = "NotApplicable"
}

/**
 * Values for compliance status calculations
 */
export const COMPLIANCE_VALUES = {
  [ComplianceStatus.Compliant]: 1,
  [ComplianceStatus.PartiallyCompliant]: 0.5,
  [ComplianceStatus.NonCompliant]: 0,
  [ComplianceStatus.NotEvaluated]: 0,
  [ComplianceStatus.NotApplicable]: 0
};

/**
 * Importance levels for requirements
 */
export enum ImportanceLevel {
  Majeur = "Majeur",
  Important = "Important",
  Moyen = "Moyen",
  Mineur = "Mineur",
  NA = "N/A"
}

/**
 * Priority levels for actions
 */
export enum ActionPriority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Critical = "Critical"
}

/**
 * Status values for actions
 */
export enum ActionStatus {
  Open = "Open",
  InProgress = "In Progress",
  Done = "Done",
  Blocked = "Blocked",
  ToDo = "To Do"
}
