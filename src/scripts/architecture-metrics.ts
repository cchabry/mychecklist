
#!/usr/bin/env node;
/**
 * Script de génération de métriques d'architecture
 * 
 * Ce script analyse la base de code et génère des métriques
 * de conformité architecturale. Les résultats sont exportés
 * au format JSON pour être utilisés par le tableau de bord.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '..');
const FEATURES_DIR = path.join(ROOT_DIR, 'features');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const HOOKS_DIR = path.join(ROOT_DIR, 'hooks');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');
const TYPES_DIR = path.join(ROOT_DIR, 'types');
const OUTPUT_DIR = path.join(ROOT_DIR, '..', 'reports');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'architecture-metrics.json');

// Structure attendue pour une feature
const EXPECTED_FEATURE_STRUCTURE = [
  'components/index.ts',
  'hooks/index.ts',
  'types.ts',
  'utils.ts',
  'constants.ts',
  'index.ts'
];

// Patterns d'export attendus
const EXPECTED_EXPORTS = {
  feature: [
    /export \* from ['"]\.\/components['"]/,
    /export \* from ['"]\.\/hooks['"]/,
    /export \* from ['"]\.\/types['"]/,
    /export \* from ['"]\.\/utils['"]/,
    /export \* from ['"]\.\/constants['"]/
  ],
  componentIndex: [/export \* from/],
  hookIndex: [/export \{ .+ \} from/]
};

// Métriques globales
interface ArchitectureMetrics {
  timestamp: string;
  summary: {
    featuresTotal: number;
    featuresCompliant: number;
    complianceRate: number;
    issuesTotal: number;
    filesByCategory: Record<string, number>;
  };
  domainDetails: {
    features: FeatureMetric[];
    services: ServiceMetric[];
    hooks: HookMetric[];
    components: ComponentMetric[];
  };
  issues: IssueMetric[];
}

interface FeatureMetric {
  name: string;
  compliant: boolean;
  missingFiles: string[];
  missingExports: string[];
}

interface ServiceMetric {
  name: string;
  hasClearInterface: boolean;
  hasTypeDefs: boolean;
}

interface HookMetric {
  name: string;
  compliant: boolean;
  issues: string[];
}

interface ComponentMetric {
  name: string;
  hasPropsType: boolean;
  isExported: boolean;
}

interface IssueMetric {
  domain: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Initialisation des métriques
const metrics: ArchitectureMetrics = {
  timestamp: new Date().toISOString(),
  summary: {
    featuresTotal: 0,
    featuresCompliant: 0,
    complianceRate: 0,
    issuesTotal: 0,
    filesByCategory: {
      features: 0,
      services: 0,
      hooks: 0,
      components: 0,
      types: 0,
      utils: 0
    }
  },
  domainDetails: {
    features: [],
    services: [],
    hooks: [],
    components: []
  },
  issues: []
};

/**
 * Analyse une feature et collecte les métriques
 */
function analyzeFeature(featurePath: string, featureName: string): FeatureMetric {
  console.log(chalk.blue(`\nAnalysant la feature: ${featureName}`));
  
  metrics.summary.featuresTotal++;
  const featureMetric: FeatureMetric = {
    name: featureName,
    compliant: true,
    missingFiles: [],
    missingExports: []
  };
  
  // Vérifier la présence des fichiers requis
  for (const file of EXPECTED_FEATURE_STRUCTURE) {
    const filePath = path.join(featurePath, file);
    if (!fs.existsSync(filePath)) {
      console.log(chalk.yellow(`  ⚠️ Fichier manquant: ${file}`));
      featureMetric.missingFiles.push(file);
      featureMetric.compliant = false;
    } else {
      console.log(chalk.green(`  ✓ Fichier présent: ${file}`));
    }
  }
  
  // Vérifier le contenu du fichier index.ts
  const indexPath = path.join(featurePath, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    for (const pattern of EXPECTED_EXPORTS.feature) {
      if (!pattern.test(content)) {
        const exportStatement = pattern.toString().replace(/\//g, '');
        console.log(chalk.yellow(`  ⚠️ Export manquant dans index.ts: ${exportStatement}`));
        featureMetric.missingExports.push(exportStatement);
        featureMetric.compliant = false;
        
        // Ajouter un problème aux issues
        metrics.issues.push({
          domain: featureName,
          category: 'export',
          severity: 'medium',
          description: `Export manquant dans index.ts: ${exportStatement}`
        });
        metrics.summary.issuesTotal++;
      }
    }
  }
  
  // Résultat
  if (featureMetric.compliant) {
    console.log(chalk.green(`  ✓ La feature ${featureName} est conforme à l'architecture`));
    metrics.summary.featuresCompliant++;
  } else {
    console.log(chalk.red(`  ✗ La feature ${featureName} n'est pas conforme à l'architecture`));
    
    // Ajouter un problème aux issues pour les fichiers manquants
    if (featureMetric.missingFiles.length > 0) {
      metrics.issues.push({
        domain: featureName,
        category: 'structure',
        severity: 'high',
        description: `${featureMetric.missingFiles.length} fichiers manquants: ${featureMetric.missingFiles.join(', ')}`
      });
      metrics.summary.issuesTotal++;
    }
  }
  
  return featureMetric;
}

/**
 * Compte les fichiers par catégorie
 */
function countFilesByCategory() {
  const countFilesInDir = (dir: string, category: string) => {
    if (!fs.existsSync(dir)) return 0;
    
    let count = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        // Récursion pour les sous-dossiers
        count += countFilesInDir(itemPath, category);
      } else if (itemPath.endsWith('.ts') || itemPath.endsWith('.tsx')) {
        count++;
      }
    }
    
    return count;
  };
  
  metrics.summary.filesByCategory.features = countFilesInDir(FEATURES_DIR, 'features');
  metrics.summary.filesByCategory.services = countFilesInDir(SERVICES_DIR, 'services');
  metrics.summary.filesByCategory.hooks = countFilesInDir(HOOKS_DIR, 'hooks');
  metrics.summary.filesByCategory.components = countFilesInDir(COMPONENTS_DIR, 'components');
  metrics.summary.filesByCategory.types = countFilesInDir(TYPES_DIR, 'types');
  
  console.log(chalk.blue('\nStatistiques par catégorie:'));
  console.log(`  Features: ${metrics.summary.filesByCategory.features} fichiers`);
  console.log(`  Services: ${metrics.summary.filesByCategory.services} fichiers`);
  console.log(`  Hooks: ${metrics.summary.filesByCategory.hooks} fichiers`);
  console.log(`  Components: ${metrics.summary.filesByCategory.components} fichiers`);
  console.log(`  Types: ${metrics.summary.filesByCategory.types} fichiers`);
}

/**
 * Analyse les services et collecte des métriques
 */
function analyzeServices() {
  if (!fs.existsSync(SERVICES_DIR)) return;
  
  console.log(chalk.blue('\nAnalyse des services:'));
  
  const analyzeServiceDir = (dir: string, parentPath = '') => {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = parentPath ? `${parentPath}/${item}` : item;
      
      if (fs.statSync(itemPath).isDirectory()) {
        // Récursion pour les sous-dossiers
        analyzeServiceDir(itemPath, relativePath);
      } else if (item.endsWith('Service.ts') || item.includes('service')) {
        // Analyser le service
        const serviceName = relativePath.replace('.ts', '');
        console.log(chalk.gray(`  Analysant le service: ${serviceName}`));
        
        const content = fs.readFileSync(itemPath, 'utf8');
        const hasInterface = content.includes('interface') || content.includes('type ');
        const hasTypeDefs = content.includes('import type {') || content.includes('import {') && content.includes('} from');
        
        metrics.domainDetails.services.push({
          name: serviceName,
          hasClearInterface: hasInterface,
          hasTypeDefs: hasTypeDefs
        });
        
        if (!hasInterface || !hasTypeDefs) {
          metrics.issues.push({
            domain: 'services',
            category: 'types',
            severity: 'medium',
            description: `Le service ${serviceName} ${!hasInterface ? "n'a pas d'interface claire" : "n'a pas de définitions de types importées"}`
          });
          metrics.summary.issuesTotal++;
        }
      }
    }
  };
  
  analyzeServiceDir(SERVICES_DIR);
}

/**
 * Analyse les hooks et collecte des métriques
 */
function analyzeHooks() {
  if (!fs.existsSync(HOOKS_DIR)) return;
  
  console.log(chalk.blue('\nAnalyse des hooks:'));
  
  const analyzeHookDir = (dir: string, parentPath = '') => {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = parentPath ? `${parentPath}/${item}` : item;
      
      if (fs.statSync(itemPath).isDirectory()) {
        // Récursion pour les sous-dossiers
        analyzeHookDir(itemPath, relativePath);
      } else if (item.startsWith('use') && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        // Analyser le hook
        const hookName = relativePath.replace('.ts', '').replace('.tsx', '');
        console.log(chalk.gray(`  Analysant le hook: ${hookName}`));
        
        const content = fs.readFileSync(itemPath, 'utf8');
        const issues: string[] = [];
        
        // Vérifier l'utilisation de useQuery
        const usesReactQuery = content.includes('useQuery') || content.includes('useMutation');
        const hasQueryKey = content.includes('queryKey:');
        
        if (usesReactQuery && !hasQueryKey) {
          issues.push("Utilise React Query sans queryKey explicite");
        }
        
        // Vérifier le nommage de la fonction
        const functionNameMatches = content.match(/function\s+(use[A-Z][a-zA-Z0-9]*)/);
        const functionName = functionNameMatches ? functionNameMatches[1] : null;
        
        if (!functionName || functionName !== hookName) {
          issues.push("Le nom de la fonction ne correspond pas au nom du fichier");
        }
        
        // Ajouter les métriques
        metrics.domainDetails.hooks.push({
          name: hookName,
          compliant: issues.length === 0,
          issues
        });
        
        if (issues.length > 0) {
          metrics.issues.push({
            domain: 'hooks',
            category: 'pattern',
            severity: 'low',
            description: `Le hook ${hookName} a des problèmes: ${issues.join(', ')}`
          });
          metrics.summary.issuesTotal++;
        }
      }
    }
  };
  
  analyzeHookDir(HOOKS_DIR);
}

/**
 * Analyse les composants et collecte des métriques
 */
function analyzeComponents() {
  if (!fs.existsSync(COMPONENTS_DIR)) return;
  
  console.log(chalk.blue('\nAnalyse des composants:'));
  
  const analyzeComponentDir = (dir: string, parentPath = '') => {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = parentPath ? `${parentPath}/${item}` : item;
      
      if (fs.statSync(itemPath).isDirectory()) {
        // Récursion pour les sous-dossiers
        analyzeComponentDir(itemPath, relativePath);
      } else if ((item.endsWith('.tsx') || item.endsWith('.jsx')) && !item.includes('index')) {
        // Analyser le composant
        const componentName = relativePath.replace('.tsx', '').replace('.jsx', '');
        console.log(chalk.gray(`  Analysant le composant: ${componentName}`));
        
        const content = fs.readFileSync(itemPath, 'utf8');
        const hasPropsType = content.includes('interface') || content.includes('type ') || content.includes('Props');
        const isExported = content.includes('export default') || content.includes('export function') || content.includes('export const');
        
        metrics.domainDetails.components.push({
          name: componentName,
          hasPropsType,
          isExported
        });
        
        if (!hasPropsType) {
          metrics.issues.push({
            domain: 'components',
            category: 'types',
            severity: 'medium',
            description: `Le composant ${componentName} n'a pas de type de props défini`
          });
          metrics.summary.issuesTotal++;
        }
        
        if (!isExported) {
          metrics.issues.push({
            domain: 'components',
            category: 'export',
            severity: 'low',
            description: `Le composant ${componentName} n'est pas exporté`
          });
          metrics.summary.issuesTotal++;
        }
      }
    }
  };
  
  analyzeComponentDir(COMPONENTS_DIR);
}

/**
 * Sauvegarde les métriques dans un fichier JSON
 */
function saveMetrics() {
  // Créer le répertoire de sortie s'il n'existe pas
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Calculer le taux de conformité
  metrics.summary.complianceRate = metrics.summary.featuresTotal > 0 
    ? Math.round((metrics.summary.featuresCompliant / metrics.summary.featuresTotal) * 100) 
    : 0;
  
  // Écrire le fichier JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metrics, null, 2));
  console.log(chalk.green(`\nMétriques sauvegardées dans ${OUTPUT_FILE}`));
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Génération des métriques d\'architecture'));
  console.log(chalk.gray('=========================================='));
  
  // Analyser les dossiers features
  if (fs.existsSync(FEATURES_DIR)) {
    const features = fs.readdirSync(FEATURES_DIR).filter(f => 
      fs.statSync(path.join(FEATURES_DIR, f)).isDirectory()
    );
    
    for (const feature of features) {
      const featureMetric = analyzeFeature(path.join(FEATURES_DIR, feature), feature);
      metrics.domainDetails.features.push(featureMetric);
    }
  } else {
    console.error(chalk.red('Erreur: Le dossier features n\'existe pas.'));
  }
  
  // Collecter des métriques additionnelles
  countFilesByCategory();
  analyzeServices();
  analyzeHooks();
  analyzeComponents();
  
  // Sauvegarder les métriques
  saveMetrics();
  
  // Rapport final
  console.log(chalk.gray('\n=========================================='));
  console.log(chalk.bold('Rapport des métriques d\'architecture:'));
  console.log(`Total des features: ${metrics.summary.featuresTotal}`);
  console.log(`Features conformes: ${metrics.summary.featuresCompliant}`);
  console.log(`Taux de conformité: ${metrics.summary.complianceRate}%`);
  console.log(`Total des problèmes détectés: ${metrics.summary.issuesTotal}`);
}

main();

