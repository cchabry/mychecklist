
/**
 * Utilitaires pour le service de projets
 * 
 * Ce module fournit des fonctions utilitaires pour le service de projets,
 * notamment pour la génération de données mock.
 */

import { Project } from '@/types/domain';
import { generateMockId } from '../base/BaseNotionService';

/**
 * Génère un projet mock avec des données aléatoires
 * 
 * @param id - Identifiant optionnel du projet
 * @returns Un projet avec des données aléatoires
 */
export function generateMockProject(id?: string): Project {
  const projectId = id || generateMockId('project');
  const createdDate = new Date(Date.now() - Math.random() * 10000000000);
  const updatedDate = new Date(createdDate.getTime() + Math.random() * 1000000000);
  
  const websites = [
    'example.com',
    'acme-corp.com',
    'testsite.org',
    'mywebapp.io',
    'awesomeproject.net',
    'samplesite.dev'
  ];
  
  const names = [
    'Refonte site vitrine',
    'Transformation digitale',
    'Audit technique',
    'Refactoring UX',
    'Optimisation SEO',
    'Migration de plateforme',
    'Audit d\'accessibilité'
  ];
  
  const descriptions = [
    'Projet d\'amélioration technique et ergonomique.',
    'Audit complet et plan d\'action pour améliorer l\'accessibilité.',
    'Refonte complète avec nouveau design et fonctionnalités.',
    'Migration vers une nouvelle plateforme technique.',
    'Optimisation des performances et du référencement.',
    'Analyse de l\'expérience utilisateur et recommandations.'
  ];
  
  return {
    id: projectId,
    name: names[Math.floor(Math.random() * names.length)],
    url: `https://${websites[Math.floor(Math.random() * websites.length)]}`,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    createdAt: createdDate.toISOString(),
    updatedAt: updatedDate.toISOString(),
    progress: Math.floor(Math.random() * 100)
  };
}

/**
 * Génère une liste de projets mock
 * 
 * @param count - Nombre de projets à générer
 * @returns Une liste de projets mock
 */
export function generateMockProjects(count: number = 10): Project[] {
  return Array.from({ length: count }, (_, i) => generateMockProject());
}
