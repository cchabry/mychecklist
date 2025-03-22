
import { ChecklistItem, ComplianceStatus } from '@/lib/types';

/**
 * Interface pour les propriétés brutes d'un item de checklist venant de Notion
 */
export interface NotionChecklistProperties {
  [key: string]: any;
  Consigne?: any;
  consigne?: any;
  Title?: any;
  title?: any;
  Description?: any;
  description?: any;
  Category?: any;
  category?: any;
  Categorie?: any;
  Subcategory?: any;
  subcategory?: any;
  SousCategorie?: any;
  Reference?: any;
  reference?: any;
  References?: any;
  Profil?: any;
  profil?: any;
  Profiles?: any;
  Phase?: any;
  phase?: any;
  Effort?: any;
  effort?: any;
  Priority?: any;
  priority?: any;
  Priorite?: any;
  Criteria?: any;
  criteria?: any;
  RequirementLevel?: any;
  requirementLevel?: any;
  Scope?: any;
  scope?: any;
}

/**
 * Configuration du cache pour le service de checklist
 */
export const CHECKLIST_CACHE = {
  KEY: 'notion_checklist',
  ITEM_PREFIX: 'notion_checklist_item_',
  TTL: 15 * 60 * 1000, // 15 minutes
};
