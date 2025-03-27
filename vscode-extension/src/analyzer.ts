
/**
 * Module d'analyse pour l'extension VS Code
 * 
 * Ce module réutilise les règles d'architecture du projet
 * pour analyser les fichiers dans l'éditeur.
 */

// Types pour les problèmes d'architecture
export interface ArchitectureIssue {
  message: string;
  line?: number;
  column?: number;
  code?: string;
  severity: 'error' | 'warning' | 'info';
}

// Anti-patterns à détecter
const ANTI_PATTERNS = {
  ANY_TYPE: /: any($|[,)\s;])/g,
  DIRECT_NOTION_API: /notionClient\.(?:databases|pages|blocks|users|search)/g,
  REACT_EFFECT_DEPS: /useEffect\(\(\) => \{.*\}, \[\]\)/s
};

// Règles de nommage
const NAMING_RULES = {
  HOOK_PREFIX: /^use[A-Z]/,
  COMPONENT_PREFIX: /^[A-Z]/
};

// Seuils pour la taille des fichiers
const SIZE_THRESHOLDS = {
  MAX_FILE_LINES: 300,
  MAX_COMPONENT_LINES: 200,
  MAX_HOOK_LINES: 150
};

/**
 * Analyse un fichier pour détecter les problèmes d'architecture
 */
export function analyzeFile(filePath: string, content: string): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];

  // Vérifier la taille du fichier
  issues.push(...checkFileSize(filePath, content));
  
  // Vérifier l'utilisation de 'any'
  issues.push(...checkForAnyType(content));
  
  // Vérifier les appels directs à l'API Notion
  if (!filePath.includes('/services/notion/')) {
    issues.push(...checkDirectNotionApiCalls(content));
  }
  
  // Vérifier les règles de nommage
  if (filePath.includes('/hooks/')) {
    issues.push(...checkHookNaming(filePath));
  }
  
  if (filePath.includes('/components/')) {
    issues.push(...checkComponentNaming(filePath));
  }
  
  // Vérifier les dépendances des effets React
  issues.push(...checkEffectDependencies(content));
  
  return issues;
}

/**
 * Vérifie la taille d'un fichier
 */
function checkFileSize(filePath: string, content: string): ArchitectureIssue[] {
  const lines = content.split('\n').length;
  let maxLines = SIZE_THRESHOLDS.MAX_FILE_LINES;
  
  // Ajuster le seuil selon le type de fichier
  if (filePath.includes('/components/')) {
    maxLines = SIZE_THRESHOLDS.MAX_COMPONENT_LINES;
  } else if (filePath.includes('/hooks/')) {
    maxLines = SIZE_THRESHOLDS.MAX_HOOK_LINES;
  }
  
  if (lines > maxLines) {
    return [{
      message: `Fichier trop volumineux: ${lines} lignes (maximum ${maxLines})`,
      line: 0,
      severity: 'warning',
      code: 'file-too-large'
    }];
  }
  
  return [];
}

/**
 * Vérifie l'utilisation du type 'any'
 */
function checkForAnyType(content: string): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const anyTypeRegex = ANTI_PATTERNS.ANY_TYPE;
  let match;
  
  // Trouver toutes les occurrences de 'any'
  while ((match = anyTypeRegex.exec(content)) !== null) {
    // Calculer la ligne où l'occurrence a été trouvée
    const lineNumber = (content.substring(0, match.index).match(/\n/g) || []).length;
    
    issues.push({
      message: `Utilisation de type 'any' détectée. Utilisez un type plus précis.`,
      line: lineNumber,
      severity: 'warning',
      code: 'any-type-usage'
    });
  }
  
  return issues;
}

/**
 * Vérifie les appels directs à l'API Notion
 */
function checkDirectNotionApiCalls(content: string): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const apiCallRegex = ANTI_PATTERNS.DIRECT_NOTION_API;
  let match;
  
  while ((match = apiCallRegex.exec(content)) !== null) {
    const lineNumber = (content.substring(0, match.index).match(/\n/g) || []).length;
    
    issues.push({
      message: `Appel direct à l'API Notion. Utilisez les services dédiés.`,
      line: lineNumber,
      severity: 'error',
      code: 'direct-api-call'
    });
  }
  
  return issues;
}

/**
 * Vérifie le nommage des hooks
 */
function checkHookNaming(filePath: string): ArchitectureIssue[] {
  const fileName = filePath.split('/').pop() || '';
  const baseName = fileName.replace(/\.(ts|tsx)$/, '');
  
  // Ignorer les fichiers index
  if (baseName === 'index') {
    return [];
  }
  
  if (!NAMING_RULES.HOOK_PREFIX.test(baseName)) {
    return [{
      message: `Les hooks doivent commencer par 'use' suivi d'une majuscule (${baseName})`,
      line: 0,
      severity: 'warning',
      code: 'hook-naming'
    }];
  }
  
  return [];
}

/**
 * Vérifie le nommage des composants
 */
function checkComponentNaming(filePath: string): ArchitectureIssue[] {
  const fileName = filePath.split('/').pop() || '';
  const baseName = fileName.replace(/\.(ts|tsx)$/, '');
  
  // Ignorer les fichiers index
  if (baseName === 'index') {
    return [];
  }
  
  if (!NAMING_RULES.COMPONENT_PREFIX.test(baseName)) {
    return [{
      message: `Les composants doivent commencer par une majuscule (${baseName})`,
      line: 0,
      severity: 'warning',
      code: 'component-naming'
    }];
  }
  
  return [];
}

/**
 * Vérifie les dépendances des effets React
 */
function checkEffectDependencies(content: string): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const effectRegex = ANTI_PATTERNS.REACT_EFFECT_DEPS;
  let match;
  
  while ((match = effectRegex.exec(content)) !== null) {
    const lineNumber = (content.substring(0, match.index).match(/\n/g) || []).length;
    
    issues.push({
      message: `useEffect avec tableau de dépendances vide. Vérifiez si des dépendances sont manquantes.`,
      line: lineNumber,
      severity: 'info',
      code: 'effect-deps'
    });
  }
  
  return issues;
}
