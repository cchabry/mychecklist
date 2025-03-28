
/**
 * Structure d'un audit
 */
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  version?: string;
  itemsCount?: number;
}
