
import { v4 as uuidv4 } from 'uuid';
import { consolidatedMockData } from '@/lib/mockData';
import { notionApiRequest } from '../proxyFetch';
import { SamplePage } from '@/lib/types';

/**
 * Récupère toutes les pages d'échantillon pour un projet
 */
export const getPagesByProjectId = async (projectId: string) => {
  return consolidatedMockData.getSamplePagesByProjectId(projectId);
};

/**
 * Récupère une page d'échantillon par son ID
 */
export const getPageById = async (id: string) => {
  const page = consolidatedMockData.getPageById(id);
  return page || { id, notFound: true };
};

/**
 * Crée une nouvelle page d'échantillon
 */
export const createPage = async (projectId: string, pageData: Omit<SamplePage, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newPage = {
    id: uuidv4(),
    projectId,
    ...pageData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return consolidatedMockData.createPage(newPage);
};

/**
 * Met à jour une page d'échantillon
 */
export const updatePage = async (id: string, pageData: Partial<SamplePage>) => {
  return consolidatedMockData.updatePage(id, pageData);
};

/**
 * Supprime une page d'échantillon
 */
export const deletePage = async (id: string) => {
  return consolidatedMockData.deletePage(id);
};

/**
 * Génère une capture d'écran d'une page
 */
export const generatePageScreenshot = async (url: string) => {
  // Dans un environnement de démonstration, on retourne une URL d'image factice
  return {
    success: true,
    imageUrl: `https://picsum.photos/800/600?random=${Math.random()}`
  };
};

/**
 * Vérifie l'accessibilité d'une URL
 */
export const checkPageAccessibility = async (url: string) => {
  // Dans un environnement de démonstration, on génère des résultats aléatoires
  const randomScore = Math.floor(Math.random() * 100);
  return {
    success: true,
    score: randomScore,
    issues: randomScore < 90 ? [
      { type: 'error', message: 'Contraste insuffisant' },
      { type: 'warning', message: 'Alt manquant sur certaines images' }
    ] : []
  };
};

/**
 * Analyse le contenu d'une page
 */
export const analyzePageContent = async (url: string) => {
  // Dans un environnement de démonstration, on génère des résultats aléatoires
  return {
    success: true,
    wordCount: Math.floor(Math.random() * 2000),
    headings: ['Titre principal', 'Sous-titre 1', 'Sous-titre 2'],
    languages: ['fr-FR', 'en'],
    mainLanguage: 'fr-FR'
  };
};

/**
 * Détecte les technologies utilisées sur une page
 */
export const detectPageTechnologies = async (url: string) => {
  // Dans un environnement de démonstration, on génère des résultats aléatoires
  return {
    success: true,
    technologies: [
      { name: 'WordPress', category: 'CMS', confidence: 95 },
      { name: 'jQuery', category: 'JavaScript', confidence: 90 },
      { name: 'Bootstrap', category: 'CSS Framework', confidence: 85 }
    ]
  };
};

/**
 * Récupère les métadonnées d'une page
 */
export const getPageMetadata = async (url: string) => {
  // Dans un environnement de démonstration, on génère des résultats factices
  return {
    success: true,
    title: "Titre de la page",
    description: "Description de la page pour les moteurs de recherche",
    keywords: ["mot-clé1", "mot-clé2", "mot-clé3"],
    canonical: url
  };
};
