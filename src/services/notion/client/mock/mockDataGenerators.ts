
/**
 * Générateurs de données mock pour l'API Notion
 * 
 * Ce module fournit des fonctions pour générer des données simulées
 * pour les différentes entités Notion (utilisateurs, bases de données, pages, etc.).
 */

/**
 * Générateur de données mock pour l'API Notion
 */
class MockDataGenerator {
  /**
   * Génère un délai aléatoire pour simuler la latence réseau
   * @param min Délai minimum en ms (défaut: 100ms)
   * @param max Délai maximum en ms (défaut: 500ms)
   * @returns Promise qui se résout après le délai
   */
  async simulateDelay(min: number = 100, max: number = 500): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Génère un ID mock unique
   * @param prefix Préfixe pour l'ID (défaut: 'mock')
   * @returns ID unique au format 'prefix-timestamp-random'
   */
  generateMockId(prefix: string = 'mock'): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  
  /**
   * Génère un utilisateur mock
   * @returns Objet représentant un utilisateur Notion
   */
  generateMockUser() {
    return {
      id: 'mock-user-id',
      name: 'Utilisateur Démo',
      avatar_url: 'https://via.placeholder.com/150',
      type: 'person',
      person: {
        email: 'demo@example.com'
      }
    };
  }
  
  /**
   * Génère des propriétés pour une base de données mock
   * @returns Objet représentant les propriétés d'une base Notion
   */
  generateMockDatabaseProperties() {
    return {
      'Nom': {
        id: 'title',
        name: 'Nom',
        type: 'title'
      },
      'Statut': {
        id: 'status',
        name: 'Statut',
        type: 'select',
        select: {
          options: [
            { id: 'option-1', name: 'À faire', color: 'red' },
            { id: 'option-2', name: 'En cours', color: 'yellow' },
            { id: 'option-3', name: 'Terminé', color: 'green' }
          ]
        }
      },
      'Date': {
        id: 'date',
        name: 'Date',
        type: 'date'
      }
    };
  }
  
  /**
   * Génère des propriétés pour une page mock
   * @returns Objet représentant les propriétés d'une page Notion
   */
  generateMockPageProperties() {
    return {
      'Nom': {
        id: 'title',
        type: 'title',
        title: [{ type: 'text', text: { content: 'Élément démo' } }]
      },
      'Statut': {
        id: 'status',
        type: 'select',
        select: { id: 'option-1', name: 'À faire', color: 'red' }
      },
      'Date': {
        id: 'date',
        type: 'date',
        date: { start: new Date().toISOString() }
      }
    };
  }
  
  /**
   * Génère une liste de résultats mock
   * @param count Nombre de résultats à générer
   * @returns Tableau d'objets simulant des résultats Notion
   */
  generateMockResults(count: number = 5) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      results.push({
        id: this.generateMockId('page'),
        created_time: new Date(Date.now() - 86400000 * i).toISOString(),
        last_edited_time: new Date().toISOString(),
        properties: this.generateMockPageProperties()
      });
    }
    
    return results;
  }
  
  /**
   * Génère un projet mock
   * @returns Objet représentant un projet
   */
  generateMockProject() {
    return {
      id: this.generateMockId('project'),
      name: `Projet démo ${Math.floor(Math.random() * 100)}`,
      url: 'https://example.com',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date().toISOString(),
      progress: Math.floor(Math.random() * 100)
    };
  }
  
  /**
   * Génère un audit mock
   * @param projectId ID du projet parent (optionnel)
   * @returns Objet représentant un audit
   */
  generateMockAudit(projectId?: string) {
    return {
      id: this.generateMockId('audit'),
      projectId: projectId || this.generateMockId('project'),
      name: `Audit ${new Date().toLocaleDateString()}`,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in_progress'
    };
  }
  
  /**
   * Génère un item de checklist mock
   * @returns Objet représentant un item de checklist
   */
  generateMockChecklistItem() {
    const categories = ['Technique', 'Design', 'Contenu', 'Performance', 'Accessibilité'];
    const subcategories = ['Images', 'Navigation', 'Formulaires', 'Texte', 'Structure'];
    
    return {
      id: this.generateMockId('item'),
      consigne: `Consigne démo ${Math.floor(Math.random() * 100)}`,
      description: 'Description détaillée de la consigne à respecter pour garantir la conformité.',
      category: categories[Math.floor(Math.random() * categories.length)],
      subcategory: subcategories[Math.floor(Math.random() * subcategories.length)],
      reference: ['RGAA 1.2', 'OPQUAST 42'],
      profil: ['Développeur', 'Designer'],
      phase: ['Conception', 'Développement'],
      effort: Math.floor(Math.random() * 5) + 1,
      priority: Math.floor(Math.random() * 5) + 1
    };
  }
}

// Exporter une instance singleton
export const mockDataGenerator = new MockDataGenerator();

// Export par défaut
export default mockDataGenerator;
