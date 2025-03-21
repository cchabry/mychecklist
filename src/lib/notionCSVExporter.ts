
import { CHECKLIST_ITEMS, MOCK_PROJECTS, SAMPLE_PAGES, getMockAuditHistory, getMockActionHistory } from './mockData';

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
   * Télécharge la checklist au format CSV
   */
  downloadChecklistCSV(): void {
    const csv = this.generateChecklistCSV();
    this.downloadCSV(csv, `notion_checklist_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  /**
   * Télécharge les projets au format CSV
   */
  downloadProjectsCSV(): void {
    const csv = this.generateProjectsCSV();
    this.downloadCSV(csv, `notion_projects_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  /**
   * Télécharge les pages d'échantillon au format CSV
   */
  downloadPagesCSV(): void {
    const csv = this.generatePagesCSV();
    this.downloadCSV(csv, `notion_pages_${new Date().toISOString().split('T')[0]}.csv`);
  },
  
  /**
   * Télécharge toutes les données au format CSV
   */
  downloadAllCSV(): void {
    this.downloadChecklistCSV();
    setTimeout(() => this.downloadProjectsCSV(), 500);
    setTimeout(() => this.downloadPagesCSV(), 1000);
  }
};

export default notionCSVExporter;
