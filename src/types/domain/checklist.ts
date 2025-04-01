
import { ComplianceStatus } from "./index";

/**
 * Item de checklist
 */
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  reference?: string;
  profile?: string;
  phase?: string;
  effort?: string;
  priority?: string;
  requirementLevel?: string;
  scope?: string;
  status?: ComplianceStatus;
}
