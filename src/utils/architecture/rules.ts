
/**
 * Règles d'analyse architecturale
 * 
 * Ce module contient les fonctions pour vérifier la conformité du code
 * aux règles d'architecture définies pour le projet.
 */

import fs from 'fs';
import path from 'path';

// Limites et seuils
export const THRESHOLDS = {
  // Taille maximale des fichiers en lignes
  MAX_FILE_LINES: 300,
  // Taille maximale des fichiers de composants en lignes
  MAX_COMPONENT_LINES: 200,
  // Taille maximale des fichiers de hooks en lignes
  MAX_HOOK_LINES: 150
};

/**
 * Vérifie si un fichier dépasse la taille maximale autorisée
 */
export function checkFileSize(filePath: string, content: string): string | null {
  const lines = content.split('\n').length;
  let maxLines = THRESHOLDS.MAX_FILE_LINES;
  
  // Ajuster la limite selon le type de fichier
  if (filePath.includes('/components/')) {
    maxLines = THRESHOLDS.MAX_COMPONENT_LINES;
  } else if (filePath.includes('/hooks/')) {
    maxLines = THRESHOLDS.MAX_HOOK_LINES;
  }
  
  if (lines > maxLines) {
    return `Fichier trop volumineux: ${lines} lignes (maximum ${maxLines})`;
  }
  
  return null;
}

/**
 * Vérifie si un fichier utilise le type 'any'
 */
export function checkForAnyType(filePath: string, content: string): string[] {
  const issues: string[] = [];
  const anyTypeRegex = /: any($|[,)\s;])/g;
  const anyTypeMatches = content.match(anyTypeRegex);
  
  if (anyTypeMatches && anyTypeMatches.length > 0) {
    issues.push(`Utilisation de type 'any' détectée (${anyTypeMatches.length} occurrences)`);
  }
  
  return issues;
}

/**
 * Vérifie si un fichier contient des appels directs à l'API Notion
 * en dehors des services dédiés
 */
export function checkDirectNotionApiCalls(filePath: string, content: string): string[] {
  const issues: string[] = [];
  
  // Ignorer les fichiers dans les services Notion autorisés
  if (filePath.includes('/services/notion/')) {
    return issues;
  }
  
  const notionApiRegex = /notionClient\.(?:databases|pages|blocks|users|search)/g;
  const notionApiMatches = content.match(notionApiRegex);
  
  if (notionApiMatches && notionApiMatches.length > 0) {
    issues.push(`Appel direct à l'API Notion détecté (${notionApiMatches.length} occurrences). Utilisez les services dédiés.`);
  }
  
  return issues;
}

/**
 * Vérifie si un hook respecte la convention de nommage (useXxx)
 */
export function checkHookNaming(filePath: string): string | null {
  const fileName = path.basename(filePath);
  
  if (!fileName.startsWith('use')) {
    return `Le nom du hook ne commence pas par 'use': ${fileName}`;
  }
  
  return null;
}

/**
 * Vérifie si un composant respecte la convention de nommage (commence par une majuscule)
 */
export function checkComponentNaming(filePath: string): string | null {
  const fileName = path.basename(filePath);
  const baseName = fileName.replace(/\.(ts|tsx)$/, '');
  
  // Ignore les fichiers index.ts
  if (baseName === 'index') {
    return null;
  }
  
  if (!/^[A-Z]/.test(baseName)) {
    return `Le nom du composant ne commence pas par une majuscule: ${baseName}`;
  }
  
  return null;
}

/**
 * Vérifie si la structure d'une feature est conforme
 */
export function checkFeatureStructure(filePath: string): string[] {
  const issues: string[] = [];
  const featurePath = path.dirname(filePath);
  
  // Récupérer le nom de la feature à partir du chemin
  const featureMatch = featurePath.match(/\/features\/([^/]+)/);
  if (!featureMatch) {
    return issues; // Pas dans une feature
  }
  
  const featureName = featureMatch[1];
  const featureRoot = path.join(path.dirname(filePath), '..');
  
  // Vérifier les fichiers requis
  const requiredFiles = [
    'index.ts',
    'types.ts',
    'components/index.ts',
    'hooks/index.ts'
  ];
  
  requiredFiles.forEach(requiredFile => {
    const fullPath = path.join(featureRoot, requiredFile);
    if (!fs.existsSync(fullPath)) {
      issues.push(`Structure de feature incomplète: fichier ${requiredFile} manquant dans ${featureName}`);
    }
  });
  
  return issues;
}
