
/**
 * Types de domaine pour l'application
 * 
 * Ce fichier exporte tous les types liés au modèle de données métier
 */

export * from './models';

// Types spécifiques pour les filtres et options
export interface ProjectFilter {
  status?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'progress';
  sortDirection?: 'asc' | 'desc';
}

export interface AuditFilter {
  status?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
