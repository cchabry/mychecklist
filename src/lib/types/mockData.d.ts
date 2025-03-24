
import { Project, Audit, ChecklistItem, Exigence, Evaluation, CorrectiveAction, SamplePage } from './index';

export interface MockData {
  projects: Project[];
  audits: Audit[];
  checklist: ChecklistItem[];
  pages: SamplePage[];
  exigences: Exigence[];
  evaluations: Evaluation[];
  actions: CorrectiveAction[];
  getProjects: () => Project[];
  getProject: (id: string) => Project | undefined;
  getAudits: () => Audit[];
  getAudit: (id: string) => Audit | undefined;
  getChecklistItems: () => ChecklistItem[];
  getChecklistItem: (id: string) => ChecklistItem | undefined;
  getPages: () => SamplePage[];
  getPage: (id: string) => SamplePage | undefined;
  getProjectPages: (projectId: string) => SamplePage[];
  getExigences: () => Exigence[];
  getExigence: (id: string) => Exigence | undefined;
  getEvaluations: () => Evaluation[];
  getEvaluation: (id: string) => Evaluation | undefined;
  getActions: () => CorrectiveAction[];
  getAction: (id: string) => CorrectiveAction | undefined;
}
