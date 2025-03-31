
/**
 * Type représentant un élément de checklist
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
  effort: number;
  priority: number;
}
