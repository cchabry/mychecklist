
// État interne du mode mock
let _mockModeActive = false;
let _temporarilyForceReal = false;
let _originalMockState = false;
let _isMockModePermanent = false;
let _mockScenario = 'standard'; // standard, partial-failure, full-failure
let _mockDelay = 500; // délai simulé en ms
let _mockErrorRate = 0; // taux d'erreur simulé (0-100)

/**
 * Utilitaire pour gérer le mode mock de l'API Notion
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive(): boolean {
    // Si on force temporairement le mode réel, on retourne false
    if (_temporarilyForceReal) {
      return false;
    }
    return _mockModeActive;
  },
  
  /**
   * Active le mode mock
   */
  activate(): void {
    console.log('✅ Mode mock activé');
    _mockModeActive = true;
    
    // Stocker l'état dans localStorage pour persistance entre les sessions
    try {
      localStorage.setItem('notion_mock_mode', 'true');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    console.log('✅ Mode mock désactivé');
    _mockModeActive = false;
    
    // Mettre à jour localStorage
    try {
      localStorage.setItem('notion_mock_mode', 'false');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Bascule entre mode mock actif et inactif
   */
  toggle(): boolean {
    if (_mockModeActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return _mockModeActive;
  },
  
  /**
   * Force temporairement le mode réel pour une opération
   */
  temporarilyForceReal(): void {
    _originalMockState = _mockModeActive;
    _temporarilyForceReal = true;
    console.log('🔄 Mode réel forcé temporairement');
  },
  
  /**
   * Vérifie si le mode est temporairement forcé en réel
   */
  isTemporarilyForcedReal(): boolean {
    return _temporarilyForceReal;
  },
  
  /**
   * Restaure l'état original après un forçage temporaire
   */
  restoreState(): void {
    _temporarilyForceReal = false;
    console.log(`🔄 État mock restauré (${_originalMockState ? 'activé' : 'désactivé'})`);
  },
  
  /**
   * Alternative à restoreState pour plus de clarté dans certains cas
   */
  restoreAfterForceReal(): void {
    this.restoreState();
  },
  
  /**
   * Charge l'état depuis localStorage lors de l'initialisation
   */
  loadFromStorage(): void {
    try {
      const storedMode = localStorage.getItem('notion_mock_mode');
      if (storedMode === 'true') {
        _mockModeActive = true;
        console.log('✅ Mode mock chargé depuis localStorage (activé)');
      } else if (storedMode === 'true_permanent') {
        _mockModeActive = true;
        _isMockModePermanent = true;
        console.log('✅ Mode mock permanent chargé depuis localStorage');
      }
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Définit le mode mock comme permanent (ne peut être désactivé que manuellement)
   */
  setPermanent(): void {
    _isMockModePermanent = true;
    _mockModeActive = true;
    
    try {
      localStorage.setItem('notion_mock_mode', 'true_permanent');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
    
    console.log('🔒 Mode mock défini comme permanent');
  },
  
  /**
   * Vérifie si le mode mock est permanent
   */
  isPermanent(): boolean {
    return _isMockModePermanent;
  },
  
  /**
   * Réinitialise le mode mock (utile pour les tests)
   */
  reset(): void {
    _mockModeActive = false;
    _temporarilyForceReal = false;
    _originalMockState = false;
    _isMockModePermanent = false;
    
    try {
      localStorage.removeItem('notion_mock_mode');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },

  /**
   * Force une réinitialisation complète (y compris paramètres avancés)
   */
  forceReset(): void {
    this.reset();
    _mockScenario = 'standard';
    _mockDelay = 500;
    _mockErrorRate = 0;
    console.log('🔄 Réinitialisation complète du mode mock');
  },

  /**
   * Obtient le scénario de mock actuel
   */
  getScenario(): string {
    return _mockScenario;
  },

  /**
   * Définit le scénario de mock
   */
  setScenario(scenario: string): void {
    _mockScenario = scenario;
    console.log(`✅ Scénario mock défini: ${scenario}`);
  },

  /**
   * Obtient le délai simulé
   */
  getDelay(): number {
    return _mockDelay;
  },

  /**
   * Définit le délai simulé
   */
  setDelay(delay: number): void {
    _mockDelay = delay;
    console.log(`✅ Délai mock défini: ${delay}ms`);
  },

  /**
   * Obtient le taux d'erreur simulé
   */
  getErrorRate(): number {
    return _mockErrorRate;
  },

  /**
   * Définit le taux d'erreur simulé
   */
  setErrorRate(rate: number): void {
    _mockErrorRate = Math.max(0, Math.min(100, rate));
    console.log(`✅ Taux d'erreur mock défini: ${_mockErrorRate}%`);
  },

  /**
   * Applique un délai simulé (utile pour tester les états de chargement)
   */
  async applySimulatedDelay(): Promise<void> {
    if (this.isActive() && _mockDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, _mockDelay));
    }
  },

  /**
   * Détermine si une erreur doit être simulée en fonction du taux d'erreur
   */
  shouldSimulateError(): boolean {
    if (!this.isActive() || _mockErrorRate <= 0) {
      return false;
    }
    return Math.random() * 100 < _mockErrorRate;
  },

  /**
   * Exporte les données de mock actuelles au format CSV
   */
  exportMockDataCSV(dataType: 'checklist' | 'projects' | 'pages' | 'audits' | 'actions'): string {
    // Importation directe des données mock pour éviter les problèmes de dépendances circulaires
    const mockData = require('../mockData');
    
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

// Initialiser à partir du localStorage
if (typeof window !== 'undefined') {
  mockMode.loadFromStorage();
}

export default mockMode;
