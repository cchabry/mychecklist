import { notionApi } from '@/lib/notionProxy';
import { Project } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { operationMode } from '@/services/operationMode';

interface DiagnosticOptions {
  apiKey: string | null;
  projectsDbId: string | null;
  onStart: () => void;
  onComplete: (results: DiagnosticResults) => void;
  onProjectCreated: (project: Project) => void;
}

interface DiagnosticResults {
  apiKeyValid: boolean | null;
  projectsDbIdValid: boolean | null;
  apiConnectionValid: boolean | null;
  projectsDbConnectionValid: boolean | null;
  projectCreateSuccess: boolean | null;
}

export async function runDiagnosticTests(options: DiagnosticOptions) {
  const wasDemoMode = operationMode.isDemoMode;
  
  try {
    if (wasDemoMode) {
      operationMode.enableRealMode();
    }
    
    options.onStart();
    
    const apiKey = options.apiKey;
    const projectsDbId = options.projectsDbId;
    
    const results: DiagnosticResults = {
      apiKeyValid: null,
      projectsDbIdValid: null,
      apiConnectionValid: null,
      projectsDbConnectionValid: null,
      projectCreateSuccess: null,
    };
    
    // Test API Key
    results.apiKeyValid = !!apiKey;
    
    // Test Projects DB ID
    results.projectsDbIdValid = !!projectsDbId;
    
    if (apiKey) {
      try {
        // Test API Connection
        await notionApi.users.me(apiKey);
        results.apiConnectionValid = true;
        
        if (projectsDbId) {
          try {
            // Test Projects DB Connection
            await notionApi.databases.retrieve(projectsDbId, apiKey);
            results.projectsDbConnectionValid = true;
            
            try {
              // Test Project Creation
              const testProject: Project = {
                name: 'Test Project',
                description: 'This is a test project created by the diagnostic tool.',
                url: 'https://example.com',
                status: 'Active',
              };
              
              const newProject = await notionApi.createProject(testProject);
              
              if (newProject) {
                results.projectCreateSuccess = true;
                options.onProjectCreated(newProject);
              } else {
                results.projectCreateSuccess = false;
              }
            } catch (e) {
              results.projectCreateSuccess = false;
            }
          } catch (e) {
            results.projectsDbConnectionValid = false;
          }
        }
      } catch (e) {
        results.apiConnectionValid = false;
      }
    }
    
    options.onComplete(results);
    
  } catch (error) {
    console.error('Diagnostic error:', error);
    throw error;
  } finally {
    if (wasDemoMode) {
      operationMode.enableDemoMode('Retour après diagnostics');
    }
  }
}

export const clearDiagnosticData = () => {
  localStorage.removeItem(STORAGE_KEYS.DIAGNOSTIC_RESULTS);
};
