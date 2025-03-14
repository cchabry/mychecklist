
// Types pour l'application d'audit qualité

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  subsubcategory?: string;
  details?: string; // Détails supplémentaires à afficher à la demande
  metaRefs?: string;
  criteria?: string;
  profile?: string;
  phase?: string;
  effort?: string;
  priority?: string;
  requirementLevel?: string;
  scope?: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number; // Pourcentage de complétion 0-100
  itemsCount: number;
}

export enum ComplianceStatus {
  NonCompliant = "non-compliant",
  PartiallyCompliant = "partially-compliant",
  Compliant = "compliant",
  NotEvaluated = "not-evaluated"
}

export interface AuditItem extends ChecklistItem {
  status: ComplianceStatus;
  comment?: string;
}

export interface Audit {
  id: string;
  projectId: string;
  items: AuditItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  score: number; // Score global de conformité
}

// Valeurs pour le calcul du score
export const COMPLIANCE_VALUES = {
  [ComplianceStatus.NonCompliant]: 0,
  [ComplianceStatus.PartiallyCompliant]: 0.5,
  [ComplianceStatus.Compliant]: 1,
  [ComplianceStatus.NotEvaluated]: 0
};
