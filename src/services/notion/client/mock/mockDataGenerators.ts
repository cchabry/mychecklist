
/**
 * Générateurs de données mock pour l'API Notion
 * 
 * Ce module contient des fonctions pour générer des données
 * simulées qui imitent les réponses de l'API Notion.
 */

import { MockDataOptions } from './types';

/**
 * Générateur de données mock pour l'API Notion
 */
export class MockDataGenerator {
  private options: MockDataOptions;

  constructor(options: MockDataOptions = {}) {
    this.options = {
      delay: 300,
      defaultCount: 5,
      ...options
    };
  }

  /**
   * Simule un délai pour mieux représenter les requêtes réseau
   * @returns Promise résolue après le délai
   */
  async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.options.delay));
  }

  /**
   * Génère des propriétés fictives pour une base de données
   */
  generateMockDatabaseProperties(): Record<string, any> {
    return {
      Name: {
        id: 'title',
        name: 'Name',
        type: 'title'
      },
      Status: {
        id: 'status',
        name: 'Status',
        type: 'select',
        select: {
          options: [
            { name: 'À faire', color: 'blue' },
            { name: 'En cours', color: 'yellow' },
            { name: 'Terminé', color: 'green' }
          ]
        }
      },
      Date: {
        id: 'date',
        name: 'Date',
        type: 'date'
      },
      Category: {
        id: 'category',
        name: 'Category',
        type: 'multi_select',
        multi_select: {
          options: [
            { name: 'Technique', color: 'red' },
            { name: 'Design', color: 'purple' },
            { name: 'Contenu', color: 'green' }
          ]
        }
      }
    };
  }

  /**
   * Génère des propriétés fictives pour une page
   */
  generateMockPageProperties(): Record<string, any> {
    return {
      Name: {
        id: 'title',
        type: 'title',
        title: [{ plain_text: `Élément démo ${Date.now()}` }]
      },
      Status: {
        id: 'status',
        type: 'select',
        select: { name: 'À faire', color: 'blue' }
      },
      Date: {
        id: 'date',
        type: 'date',
        date: { start: new Date().toISOString() }
      },
      Category: {
        id: 'category',
        type: 'multi_select',
        multi_select: [{ name: 'Technique', color: 'red' }]
      }
    };
  }

  /**
   * Génère un nombre spécifié de résultats fictifs
   */
  generateMockResults(count: number = this.options.defaultCount || 5): any[] {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      results.push({
        id: `mock-result-${i}-${Date.now()}`,
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString(),
        properties: this.generateMockPageProperties()
      });
    }
    
    return results;
  }

  /**
   * Génère un utilisateur fictif
   */
  generateMockUser(): any {
    return {
      id: 'mock-user-id',
      name: 'Utilisateur Démo',
      avatar_url: 'https://via.placeholder.com/150',
      workspace_name: 'Workspace Démo'
    };
  }
}

// Exporter une instance par défaut
export const mockDataGenerator = new MockDataGenerator();
export default mockDataGenerator;
