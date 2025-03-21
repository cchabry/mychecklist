
import { CHECKLIST_ITEMS, MOCK_PROJECTS, SAMPLE_PAGES, getMockAuditHistory, getMockActionHistory } from './mockData';
import { ComplianceStatus, ImportanceLevel, ActionPriority, ActionStatus } from './types';

/**
 * Utilitaire pour exporter des données au format CSV pour Notion
 */
export const notionCSVExporter = {
  /**
   * Génère un fichier CSV pour la checklist
   */
  generateChecklistCSV(): string {
    // En-tête
    let csv = 'Name,Description,Category,Subcategory,Reference,Profile,Phase,Effort,Priority,RequirementLevel\n';
    
    // Contenu
    CHECKLIST_ITEMS.forEach(item => {
      csv += `"${item.title.replace(/"/g, '""')}","${item.description.replace(/"/g, '""')}","${item.category}","${item.subcategory}","${item.metaRefs || ''}","${item.profile}","${item.phase}","${item.effort}","${item.priority}","${item.requirementLevel}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour les projets
   */
  generateProjectsCSV(): string {
    // En-tête avec les colonnes pour Notion
    let csv = 'Name,URL,Description,Status,Progress,Pages\n';
    
    // Contenu
    MOCK_PROJECTS.forEach(project => {
      const status = project.progress === 100 ? 'Terminé' : project.progress > 0 ? 'En cours' : 'À faire';
      csv += `"${project.name}","${project.url}","Projet d'audit web","${status}","${project.progress}","${project.pagesCount}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour les pages d'échantillon
   */
  generatePagesCSV(): string {
    // En-tête
    let csv = 'Title,URL,Description,Project,Order\n';
    
    // Contenu
    SAMPLE_PAGES.forEach(page => {
      // Trouver le nom du projet correspondant
      const project = MOCK_PROJECTS.find(p => p.id === page.projectId);
      const projectName = project ? project.name : '';
      
      csv += `"${page.title}","${page.url}","${page.description || ''}","${projectName}","${page.order}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour les exigences
   */
  generateExigencesCSV(): string {
    // En-tête
    let csv = 'Name,Project,Item,Importance,Comment\n';
    
    // Contenu généré à partir des données de test
    const mockExigences = MOCK_PROJECTS.flatMap(project => 
      CHECKLIST_ITEMS.slice(0, 10).map((item, index) => {
        const importance = Object.values(ImportanceLevel)[index % 5];
        return {
          name: `Exigence ${index + 1}`,
          projectId: project.id,
          projectName: project.name,
          itemId: item.id,
          itemName: item.title,
          importance,
          comment: `Exigence spécifique pour ${item.title}`
        };
      })
    );
    
    mockExigences.forEach(exigence => {
      csv += `"${exigence.name}","${exigence.projectName}","${exigence.itemName}","${exigence.importance}","${exigence.comment}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour les audits
   */
  generateAuditsCSV(): string {
    // En-tête
    let csv = 'Name,Project,CreatedAt,Version,Score\n';
    
    // Contenu généré
    const mockAudits = MOCK_PROJECTS.flatMap(project => {
      return [
        {
          name: `Audit initial - ${project.name}`,
          projectName: project.name,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          version: '1.0',
          score: Math.floor(Math.random() * 70)
        },
        {
          name: `Audit de suivi - ${project.name}`,
          projectName: project.name,
          createdAt: new Date().toISOString().split('T')[0],
          version: '1.1',
          score: Math.floor(Math.random() * 30) + 70
        }
      ];
    });
    
    mockAudits.forEach(audit => {
      csv += `"${audit.name}","${audit.projectName}","${audit.createdAt}","${audit.version}","${audit.score}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour les évaluations
   */
  generateEvaluationsCSV(): string {
    // En-tête
    let csv = 'Name,Audit,Page,Exigence,Score,Comment,CreatedAt\n';
    
    // Générer des données fictives pour les évaluations
    const mockAudits = getMockAuditHistory();
    const mockEvaluations = [];
    
    mockAudits.forEach((audit, auditIndex) => {
      SAMPLE_PAGES.filter(p => p.projectId === audit.projectId).forEach((page, pageIndex) => {
        CHECKLIST_ITEMS.slice(0, 5).forEach((item, itemIndex) => {
          const statuses = Object.values(ComplianceStatus);
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          mockEvaluations.push({
            name: `Évaluation ${auditIndex * 100 + pageIndex * 10 + itemIndex + 1}`,
            auditName: audit.name,
            pageName: page.title,
            exigenceName: `Exigence pour ${item.title}`,
            status,
            comment: `Commentaire sur l'évaluation de ${item.title} pour ${page.title}`,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        });
      });
    });
    
    mockEvaluations.forEach(eval => {
      csv += `"${eval.name}","${eval.auditName}","${eval.pageName}","${eval.exigenceName}","${eval.status}","${eval.comment}","${eval.createdAt}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour les actions correctives
   */
  generateActionsCSV(): string {
    // En-tête
    let csv = 'Name,Evaluation,TargetScore,Priority,DueDate,Responsible,Status,Comment\n';
    
    // Générer des données fictives pour les actions
    const mockActions = getMockActionHistory().slice(0, 20);
    
    mockActions.forEach((action, index) => {
      const priorities = Object.values(ActionPriority);
      const statuses = Object.values(ActionStatus);
      const dueDate = new Date(Date.now() + (Math.random() * 60 + 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      csv += `"Action corrective ${index + 1}","Évaluation ${Math.floor(Math.random() * 50) + 1}","${ComplianceStatus.Compliant}","${priorities[index % priorities.length]}","${dueDate}","${action.responsible}","${statuses[index % statuses.length]}","${action.comment}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Génère un fichier CSV pour le suivi des actions (progress)
   */
  generateProgressCSV(): string {
    // En-tête
    let csv = 'Name,Action,Date,Responsible,Score,Status,Comment\n';
    
    // Générer des données fictives pour le suivi des actions
    const mockProgress = [];
    
    for (let i = 0; i < 15; i++) {
      const statuses = Object.values(ActionStatus);
      const complianceStatuses = Object.values(ComplianceStatus);
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      mockProgress.push({
        name: `Suivi ${i + 1}`,
        actionName: `Action corrective ${Math.floor(Math.random() * 20) + 1}`,
        date,
        responsible: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'][Math.floor(Math.random() * 4)],
        score: complianceStatuses[Math.floor(Math.random() * complianceStatuses.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        comment: `Mise à jour du ${date} pour l'action corrective`
      });
    }
    
    mockProgress.forEach(progress => {
      csv += `"${progress.name}","${progress.actionName}","${progress.date}","${progress.responsible}","${progress.score}","${progress.status}","${progress.comment}"\n`;
    });
    
    return csv;
  },
  
  /**
   * Télécharge un fichier CSV
   */
  downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  /**
   * Télécharge les fichiers CSV individuels
   */
  downloadChecklistCSV(): void {
    const csv = this.generateChecklistCSV();
    this.downloadCSV(csv, `notion_checklist_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadProjectsCSV(): void {
    const csv = this.generateProjectsCSV();
    this.downloadCSV(csv, `notion_projects_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadPagesCSV(): void {
    const csv = this.generatePagesCSV();
    this.downloadCSV(csv, `notion_pages_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadExigencesCSV(): void {
    const csv = this.generateExigencesCSV();
    this.downloadCSV(csv, `notion_exigences_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadAuditsCSV(): void {
    const csv = this.generateAuditsCSV();
    this.downloadCSV(csv, `notion_audits_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadEvaluationsCSV(): void {
    const csv = this.generateEvaluationsCSV();
    this.downloadCSV(csv, `notion_evaluations_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadActionsCSV(): void {
    const csv = this.generateActionsCSV();
    this.downloadCSV(csv, `notion_actions_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  downloadProgressCSV(): void {
    const csv = this.generateProgressCSV();
    this.downloadCSV(csv, `notion_progress_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  /**
   * Télécharge toutes les données au format CSV
   */
  downloadAllCSV(): void {
    // Espacer les téléchargements pour éviter les problèmes de navigateur
    this.downloadChecklistCSV();
    setTimeout(() => this.downloadProjectsCSV(), 300);
    setTimeout(() => this.downloadPagesCSV(), 600);
    setTimeout(() => this.downloadExigencesCSV(), 900);
    setTimeout(() => this.downloadAuditsCSV(), 1200);
    setTimeout(() => this.downloadEvaluationsCSV(), 1500);
    setTimeout(() => this.downloadActionsCSV(), 1800);
    setTimeout(() => this.downloadProgressCSV(), 2100);
  }
};

export default notionCSVExporter;
