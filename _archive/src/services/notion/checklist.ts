
import { ChecklistItem } from '@/lib/types';
import { checklistService } from './checklist/index';

// Re-export le service de checklist
export { checklistService };

/**
 * Service de gestion du référentiel de bonnes pratiques (checklist) via Notion
 * 
 * @deprecated Utilisez plutôt le checklistService importé depuis './checklist/index'
 */
export default checklistService;
