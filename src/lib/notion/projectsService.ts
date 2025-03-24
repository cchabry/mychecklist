
/**
 * Notion Projects Service
 * Provides functions for managing projects in Notion
 */

// Import functionality from modular files
import { getProjectsFromNotion, getProjectById } from './projectFetch';
import { createProjectInNotion } from './projectCreate';
import { processSamplePage } from './utils';

// Re-export all functions
export {
  getProjectsFromNotion,
  getProjectById,
  createProjectInNotion,
  processSamplePage
};
