
/**
 * Structure d'un audit
 */
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  progress: number; // Changed from optional to required
  version?: string;
  itemsCount?: number;
}
