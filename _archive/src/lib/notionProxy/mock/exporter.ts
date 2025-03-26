
/**
 * Module pour l'exportation de données mock
 */
export const mockExporter = {
  /**
   * Exporte les données de mock actuelles au format CSV
   */
  exportMockDataCSV(dataType: 'checklist' | 'projects' | 'pages' | 'audits' | 'actions'): string {
    // Importation dynamique des données mock pour éviter les problèmes de dépendances circulaires
    const mockData = require('../../mockData');
    
    let csv = '';
    
    switch(dataType) {
      case 'checklist':
        // En-tête
        csv = 'id,title,description,category,subcategory,metaRefs,criteria,profile,phase,effort,priority,requirementLevel,scope\n';
        
        // Contenu
        mockData.CHECKLIST_ITEMS.forEach((item: any) => {
          csv += `"${item.id}","${item.title}","${item.description.replace(/"/g, '""')}","${item.category}","${item.subcategory}","${item.metaRefs || ''}","${item.criteria}","${item.profile}","${item.phase}","${item.effort}","${item.priority}","${item.requirementLevel}","${item.scope}"\n`;
        });
        break;
        
      case 'projects':
        // En-tête
        csv = 'id,name,url,createdAt,updatedAt,progress,itemsCount,pagesCount\n';
        
        // Contenu
        mockData.MOCK_PROJECTS.forEach((project: any) => {
          csv += `"${project.id}","${project.name}","${project.url}","${project.createdAt}","${project.updatedAt}","${project.progress}","${project.itemsCount}","${project.pagesCount}"\n`;
        });
        break;
        
      case 'pages':
        // En-tête
        csv = 'id,projectId,url,title,description,order\n';
        
        // Contenu
        mockData.SAMPLE_PAGES.forEach((page: any) => {
          csv += `"${page.id}","${page.projectId}","${page.url}","${page.title}","${page.description || ''}","${page.order}"\n`;
        });
        break;
        
      case 'audits':
        // En-tête pour les audits simplifiés (sans les items détaillés)
        csv = 'id,projectId,name,createdAt,updatedAt,completedAt,score,version\n';
        
        // Contenu des audits d'historique
        mockData.getMockAuditHistory('project-1').forEach((audit: any) => {
          csv += `"${audit.id}","${audit.projectId}","${audit.name}","${audit.createdAt}","${audit.updatedAt}","${audit.completedAt || ''}","${audit.score}","${audit.version}"\n`;
        });
        break;
        
      case 'actions':
        // En-tête
        csv = 'id,evaluationId,pageId,targetScore,priority,dueDate,responsible,comment,status,createdAt,updatedAt\n';
        
        // Contenu
        mockData.getMockActionHistory('project-1').forEach((action: any) => {
          csv += `"${action.id}","${action.evaluationId}","${action.pageId}","${action.targetScore}","${action.priority}","${action.dueDate}","${action.responsible}","${action.comment.replace(/"/g, '""')}","${action.status}","${action.createdAt}","${action.updatedAt}"\n`;
        });
        break;
    }
    
    return csv;
  },
  
  /**
   * Télécharge les données de mock au format CSV
   */
  downloadMockDataCSV(dataType: 'checklist' | 'projects' | 'pages' | 'audits' | 'actions'): void {
    const csv = this.exportMockDataCSV(dataType);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `notion_${dataType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
