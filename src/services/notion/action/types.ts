
/**
 * Types et interfaces pour les actions correctives
 */

import { NotionResponse } from '../types';
import { CorrectiveAction, ActionProgress } from '@/types/domain';

export type CreateActionInput = Omit<CorrectiveAction, 'id'>;
export type ActionResponse = NotionResponse<CorrectiveAction>;
export type ActionsResponse = NotionResponse<CorrectiveAction[]>;
export type ActionDeleteResponse = NotionResponse<boolean>;

export type CreateProgressInput = Omit<ActionProgress, 'id'>;
export type ProgressResponse = NotionResponse<ActionProgress>;
export type ProgressListResponse = NotionResponse<ActionProgress[]>;
export type ProgressDeleteResponse = NotionResponse<boolean>;
