#!/usr/bin/env node
/**
 * Script de génération de métriques d'architecture
 * 
 * Ce script analyse la structure du code et calcule des métriques
 * de conformité architecturale selon les standards du projet.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import chalk from 'chalk';
import { saveCurrentMetrics } from '../utils/tracking/architecture-tracker';

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, '..', 'reports');

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

// Interface pour les métriques
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

/**
 * Analyse une feature et vérifie sa conformité
 */
function analyzeFeature(featurePath: string, featureName: string): FeatureMetric {
  const missingFiles = [];
  const missingExports = [];
  
  // Vérifier la présence des fichiers requis
  for (const file of EXPECTED_FEATURE_STRUCTURE) {
    const filePath = path.join(featurePath, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }
  
  // Vérifier le contenu du fichier index.ts
  const indexPath = path.join(featurePath, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    for (const pattern of EXPECTED_EXPORTS.feature) {
      if (!pattern.test(content)) {
        const exportStatement = pattern.toString().replace(/\//g, '');
        missingExports.push(exportStatement);
      }
    }
  }
  
  return {
    name: featureName,
    compliant: missingFiles.length === 0 && missingExports.length === 0,
    missingFiles,
    missingExports
  };
}

/**
 * Analyse un service et vérifie sa conformité
 */
function analyzeService(servicePath: string, serviceName: string): ServiceMetric {
  const content = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf8') : '';
  
  // Vérifier si le service a une interface claire (exports nommés)
  const hasClearInterface = /export const \w+ =/.test(content) || /export function \w+/.test(content);
  
  // Vérifier si le service a des définitions de types
  const hasTypeDefs = /interface \w+/.test(content) || /type \w+ =/.test(content);
  
  return {
    name: serviceName,
    hasClearInterface,
    hasTypeDefs
  };
}

/**
 * Analyse un hook et vérifie sa conformité
 */
function analyzeHook(hookPath: string, hookName: string): HookMetric {
  const issues = [];
  
  if (!fs.existsSync(hookPath)) {
    return {
      name: hookName,
      compliant: false,
      issues: ['Le fichier n\'existe pas']
    };
  }
  
  const content = fs.readFileSync(hookPath, 'utf8');
  
  // Vérifier si le hook commence par "use"
  if (!hookName.startsWith('use')) {
    issues.push('Le nom du hook ne commence pas par "use"');
  }
  
  // Vérifier si le hook est exporté
  if (!content.includes(`export function ${hookName}`)) {
    issues.push('Le hook n\'est pas exporté correctement');
  }
  
  // Vérifier si le hook a une documentation
  if (!content.includes('/**') || !content.includes('*/')) {
    issues.push('Le hook n\'a pas de documentation JSDoc');
  }
  
  return {
    name: hookName,
    compliant: issues.length === 0,
    issues
  };
}

/**
 * Analyse un composant et vérifie sa conformité
 */
function analyzeComponent(componentPath: string, componentName: string): ComponentMetric {
  if (!fs.existsSync(componentPath)) {
    return {
      name: componentName,
      hasPropsType: false,
      isExported: false
    };
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Vérifier si le composant a un type pour ses props
  const hasPropsType = content.includes(`interface ${componentName}Props`) || 
                       content.includes(`type ${componentName}Props =`) ||
                       content.includes(': React.FC<');
  
  // Vérifier si le composant est exporté
  const isExported = content.includes(`export function ${componentName}`) || 
                     content.includes(`export const ${componentName}`);
  
  return {
    name: componentName,
    hasPropsType,
    isExported
  };
}

/**
 * Analyse la base de code complète
 */
function analyzeCodebase(): ArchitectureMetrics {
  const metrics: ArchitectureMetrics = {
    timestamp: new Date().toISOString(),
    summary: {
      featuresTotal: 0,
      featuresCompliant: 0,
      complianceRate: 0,
      issuesTotal: 0,
      filesByCategory: {}
    },
    domainDetails: {
      features: [],
      services: [],
      hooks: [],
      components: []
    },
    issues: []
  };
  
  // Analyser les features
  const featuresDir = path.join(ROOT_DIR, 'features');
  if (fs.existsSync(featuresDir)) {
    const features = fs.readdirSync(featuresDir).filter(f => 
      fs.statSync(path.join(featuresDir, f)).isDirectory()
    );
    
    metrics.summary.featuresTotal = features.length;
    
    for (const feature of features) {
      const featureMetric = analyzeFeature(path.join(featuresDir, feature), feature);
      metrics.domainDetails.features.push(featureMetric);
      
      if (featureMetric.compliant) {
        metrics.summary.featuresCompliant++;
      } else {
        // Ajouter des problèmes pour les fichiers manquants
        for (const missingFile of featureMetric.missingFiles) {
          metrics.issues.push({
            domain: feature,
            category: 'structure',
            severity: 'medium',
            description: `Fichier manquant: ${missingFile}`
          });
        }
        
        // Ajouter des problèmes pour les exports manquants
        for (const missingExport of featureMetric.missingExports) {
          metrics.issues.push({
            domain: feature,
            category: 'exports',
            severity: 'low',
            description: `Export manquant: ${missingExport}`
          });
        }
      }
    }
    
    // Calculer le taux de conformité
    metrics.summary.complianceRate = features.length > 0
      ? Math.round((metrics.summary.featuresCompliant / metrics.summary.featuresTotal) * 100)
      : 0;
  }
  
  // Analyser les services
  const servicesDir = path.join(ROOT_DIR, 'services');
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = glob.sync('**/*.ts', { cwd: servicesDir });
    
    for (const serviceFile of serviceFiles) {
      const serviceName = path.basename(serviceFile, '.ts');
      const serviceMetric = analyzeService(path.join(servicesDir, serviceFile), serviceName);
      metrics.domainDetails.services.push(serviceMetric);
      
      if (!serviceMetric.hasClearInterface) {
        metrics.issues.push({
          domain: 'services',
          category: 'interface',
          severity: 'medium',
          description: `Le service ${serviceName} n'a pas d'interface claire`
        });
      }
      
      if (!serviceMetric.hasTypeDefs) {
        metrics.issues.push({
          domain: 'services',
          category: 'types',
          severity: 'medium',
          description: `Le service ${serviceName} n'a pas de définitions de types`
        });
      }
    }
  }
  
  // Analyser les hooks
  const hooksDir = path.join(ROOT_DIR, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const hookFiles = glob.sync('**/*.ts', { cwd: hooksDir });
    
    for (const hookFile of hookFiles) {
      const hookName = path.basename(hookFile, '.ts');
      const hookMetric = analyzeHook(path.join(hooksDir, hookFile), hookName);
      metrics.domainDetails.hooks.push(hookMetric);
      
      if (!hookMetric.compliant) {
        for (const issue of hookMetric.issues) {
          metrics.issues.push({
            domain: 'hooks',
            category: 'convention',
            severity: 'low',
            description: `Hook ${hookName}: ${issue}`
          });
        }
      }
    }
  }
  
  // Analyser les composants
  const componentsDir = path.join(ROOT_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = glob.sync('**/*.tsx', { cwd: componentsDir });
    
    for (const componentFile of componentFiles) {
      const componentName = path.basename(componentFile, '.tsx');
      const componentMetric = analyzeComponent(path.join(componentsDir, componentFile), componentName);
      metrics.domainDetails.components.push(componentMetric);
      
      if (!componentMetric.hasPropsType) {
        metrics.issues.push({
          domain: 'components',
          category: 'types',
          severity: 'medium',
          description: `Le composant ${componentName} n'a pas de type pour ses props`
        });
      }
      
      if (!componentMetric.isExported) {
        metrics.issues.push({
          domain: 'components',
          category: 'exports',
          severity: 'low',
          description: `Le composant ${componentName} n'est pas exporté correctement`
        });
      }
    }
  }
  
  // Compter les fichiers par catégorie
  const filePatterns = {
    'Composants': ['components/**/*.tsx', 'features/*/components/**/*.tsx'],
    'Hooks': ['hooks/**/*.ts', 'features/*/hooks/**/*.ts'],
    'Services': ['services/**/*.ts'],
    'Types': ['types/**/*.ts', 'features/*/types.ts'],
    'Utilitaires': ['utils/**/*.ts', 'features/*/utils.ts'],
    'Tests': ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx']
  };
  
  for (const [category, patterns] of Object.entries(filePatterns)) {
    let count = 0;
    for (const pattern of patterns) {
      count += glob.sync(pattern, { cwd: ROOT_DIR }).length;
    }
    metrics.summary.filesByCategory[category] = count;
  }
  
  // Calculer le nombre total de problèmes
  metrics.summary.issuesTotal = metrics.issues.length;
  
  return metrics;
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Génération des métriques d\'architecture'));
  console.log(chalk.gray('=========================================='));
  
  // Analyser la base de code
  const metrics = analyzeCodebase();
  
  // Sauvegarder les métriques au format JSON
  const outputFile = path.join(REPORTS_DIR, 'architecture-metrics.json');
  const outputDir = path.dirname(outputFile);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(metrics, null, 2));
  
  // Sauvegarder les métriques dans l'historique pour le suivi des tendances
  saveCurrentMetrics(
    metrics.summary.complianceRate,
    metrics.summary.issuesTotal,
    metrics.summary.featuresTotal
  );
  
  // Afficher le résumé
  console.log(chalk.green(`\nMétriques générées avec succès dans ${outputFile}`));
  console.log(`Taux de conformité global: ${metrics.summary.complianceRate}%`);
  console.log(`Nombre total de features: ${metrics.summary.featuresTotal}`);
  console.log(`Nombre de features conformes: ${metrics.summary.featuresCompliant}`);
  console.log(`Nombre total de problèmes: ${metrics.summary.issuesTotal}`);
}

main();
