
import { mockData as existingMockData } from '@/lib/mockData/index';
import { ComplianceStatus, ImportanceLevel, Exigence } from '@/lib/types';

// First, let's extend the type of existingMockData
type MockDataWithGenerateExigence = typeof existingMockData & {
  generateMockExigence?: (projectId: string, itemId: string) => Exigence;
};

// Cast existingMockData to the extended type
const typedMockData = existingMockData as MockDataWithGenerateExigence;

// Add missing properties to mockData if they don't exist
if (!typedMockData.exigences) {
  typedMockData.exigences = [];
}

if (!typedMockData.evaluations) {
  typedMockData.evaluations = [];
}

if (!typedMockData.actions) {
  typedMockData.actions = [];
}

// Add utility methods if they don't exist
if (!typedMockData.getEvaluations) {
  typedMockData.getEvaluations = () => typedMockData.evaluations || [];
}

if (!typedMockData.getEvaluation) {
  typedMockData.getEvaluation = (id) => typedMockData.evaluations.find(e => e.id === id) || null;
}

if (!typedMockData.createEvaluation) {
  typedMockData.createEvaluation = (data) => {
    const newEval = { ...data, id: `eval_${Date.now()}` };
    typedMockData.evaluations.push(newEval);
    return newEval;
  };
}

if (!typedMockData.updateEvaluation) {
  typedMockData.updateEvaluation = (id, data) => {
    const index = typedMockData.evaluations.findIndex(e => e.id === id);
    if (index >= 0) {
      typedMockData.evaluations[index] = { ...typedMockData.evaluations[index], ...data };
      return typedMockData.evaluations[index];
    }
    return { ...data, id };
  };
}

if (!typedMockData.deleteEvaluation) {
  typedMockData.deleteEvaluation = () => {
    return true;
  };
}

if (!typedMockData.getActions) {
  typedMockData.getActions = () => typedMockData.actions || [];
}

if (!typedMockData.getAction) {
  typedMockData.getAction = (id) => typedMockData.actions.find(a => a.id === id) || null;
}

if (!typedMockData.createAction) {
  typedMockData.createAction = (data) => {
    const newAction = { ...data, id: `action_${Date.now()}` };
    typedMockData.actions.push(newAction);
    return newAction;
  };
}

if (!typedMockData.updateAction) {
  typedMockData.updateAction = (id, data) => {
    const index = typedMockData.actions.findIndex(a => a.id === id);
    if (index >= 0) {
      typedMockData.actions[index] = { ...typedMockData.actions[index], ...data };
      return typedMockData.actions[index];
    }
    return { ...data, id };
  };
}

if (!typedMockData.deleteAction) {
  typedMockData.deleteAction = () => {
    return true;
  };
}

// Add the generateMockExigence function if it doesn't exist
if (!typedMockData.generateMockExigence) {
  typedMockData.generateMockExigence = function(projectId: string, itemId: string) {
    return {
      id: `exigence_${Date.now()}`,
      projectId,
      itemId,
      importance: ImportanceLevel.Moyen,
      comment: 'Exigence générée automatiquement'
    };
  };
}

// Create a new object with all the properties from existingMockData
const mockDataExtensions = {
  ...typedMockData
};

export { mockDataExtensions };
