
import { mockData as existingMockData } from '@/lib/mockData/index';
import { ComplianceStatus, ImportanceLevel } from '@/lib/types';

// Add missing properties to mockData if they don't exist
if (!existingMockData.exigences) {
  existingMockData.exigences = [];
}

if (!existingMockData.evaluations) {
  existingMockData.evaluations = [];
}

if (!existingMockData.actions) {
  existingMockData.actions = [];
}

// Add utility methods if they don't exist
if (!existingMockData.getEvaluations) {
  existingMockData.getEvaluations = () => existingMockData.evaluations || [];
}

if (!existingMockData.getEvaluation) {
  existingMockData.getEvaluation = (id) => existingMockData.evaluations.find(e => e.id === id) || null;
}

if (!existingMockData.createEvaluation) {
  existingMockData.createEvaluation = (data) => {
    const newEval = { ...data, id: `eval_${Date.now()}` };
    existingMockData.evaluations.push(newEval);
    return newEval;
  };
}

if (!existingMockData.updateEvaluation) {
  existingMockData.updateEvaluation = (id, data) => {
    const index = existingMockData.evaluations.findIndex(e => e.id === id);
    if (index >= 0) {
      existingMockData.evaluations[index] = { ...existingMockData.evaluations[index], ...data };
      return existingMockData.evaluations[index];
    }
    return { ...data, id };
  };
}

if (!existingMockData.deleteEvaluation) {
  existingMockData.deleteEvaluation = (id) => {
    const index = existingMockData.evaluations.findIndex(e => e.id === id);
    if (index >= 0) {
      existingMockData.evaluations.splice(index, 1);
    }
    return true;
  };
}

if (!existingMockData.getActions) {
  existingMockData.getActions = () => existingMockData.actions || [];
}

if (!existingMockData.getAction) {
  existingMockData.getAction = (id) => existingMockData.actions.find(a => a.id === id) || null;
}

if (!existingMockData.createAction) {
  existingMockData.createAction = (data) => {
    const newAction = { ...data, id: `action_${Date.now()}` };
    existingMockData.actions.push(newAction);
    return newAction;
  };
}

if (!existingMockData.updateAction) {
  existingMockData.updateAction = (id, data) => {
    const index = existingMockData.actions.findIndex(a => a.id === id);
    if (index >= 0) {
      existingMockData.actions[index] = { ...existingMockData.actions[index], ...data };
      return existingMockData.actions[index];
    }
    return { ...data, id };
  };
}

if (!existingMockData.deleteAction) {
  existingMockData.deleteAction = (id) => {
    const index = existingMockData.actions.findIndex(a => a.id === id);
    if (index >= 0) {
      existingMockData.actions.splice(index, 1);
    }
    return true;
  };
}

// Ensure generateMockExigence function exists
if (!existingMockData.generateMockExigence) {
  existingMockData.generateMockExigence = (projectId: string, itemId: string) => {
    return {
      id: `exigence_${Date.now()}`,
      projectId,
      itemId,
      importance: ImportanceLevel.Moyen,
      comment: 'Exigence générée automatiquement'
    };
  };
}

export { existingMockData as mockDataExtensions };
