
/**
 * Types pour le nouveau client Notion
 */

import { ApiResponse } from '@/services/apiProxy';

// Types de ressources Notion
export type NotionResourceType = 'database' | 'page' | 'block' | 'user';

// Types de réponses Notion
export interface NotionUser {
  id: string;
  name?: string;
  avatar_url?: string;
  type?: 'person' | 'bot';
  email?: string;
}

export interface NotionDatabase {
  id: string;
  title: Array<{
    type: string;
    text?: {
      content: string;
      link?: string | null;
    };
    plain_text?: string;
  }>;
  description?: any[];
  properties: Record<string, any>;
  parent?: {
    type: string;
    page_id?: string;
    workspace?: boolean;
  };
  url?: string;
  archived?: boolean;
}

export interface NotionPage {
  id: string;
  parent: {
    type: string;
    database_id?: string;
    page_id?: string;
    workspace?: boolean;
  };
  properties: Record<string, any>;
  url?: string;
  archived?: boolean;
  created_time: string;
  last_edited_time: string;
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  archived?: boolean;
  created_time?: string;
  last_edited_time?: string;
  [key: string]: any; // Pour les propriétés spécifiques à chaque type de bloc
}

// Interfaces pour les paramètres des requêtes
export interface DatabaseQueryParams {
  filter?: any;
  sorts?: Array<{
    property?: string;
    timestamp?: 'created_time' | 'last_edited_time';
    direction: 'ascending' | 'descending';
  }>;
  start_cursor?: string;
  page_size?: number;
}

export interface SearchParams {
  query?: string;
  sort?: {
    direction: 'ascending' | 'descending';
    timestamp: 'last_edited_time';
  };
  filter?: {
    property: 'object';
    value: NotionResourceType;
  };
  start_cursor?: string;
  page_size?: number;
}

// Réponses API
export interface NotionListResponse<T> {
  object: 'list';
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
}

// Résultats typés pour faciliter l'utilisation
export type NotionUserResponse = ApiResponse<NotionUser>;
export type NotionUsersResponse = ApiResponse<NotionListResponse<NotionUser>>;
export type NotionDatabaseResponse = ApiResponse<NotionDatabase>;
export type NotionDatabasesResponse = ApiResponse<NotionListResponse<NotionDatabase>>;
export type NotionPageResponse = ApiResponse<NotionPage>;
export type NotionPagesResponse = ApiResponse<NotionListResponse<NotionPage>>;
export type NotionBlockResponse = ApiResponse<NotionBlock>;
export type NotionBlocksResponse = ApiResponse<NotionListResponse<NotionBlock>>;
export type NotionSearchResponse = ApiResponse<NotionListResponse<NotionPage | NotionDatabase>>;

// Configuration du client Notion
export interface NotionClientConfig {
  apiVersion?: string;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  debug?: boolean;
}
