#!/usr/bin/env node;
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
import { 
  getAllRules,
  getRulesByDomain,
  getAllThresholds,
  getThresholdsByDomain,
  getThreshold,
  ArchitectureMetrics,
  FeatureMetric,
  ServiceMetric,
  HookMetric,
  ComponentMetric,
  IssueMetric,
  DetectedAntiPattern,
  ThresholdViolation
} from '../utils/dashboard';

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
 * Détecte les anti-patterns généraux dans le code
 */
function detectGeneralAntiPatterns(): DetectedAntiPattern[] {
  const detectedPatterns: DetectedAntiPattern[] = [];
  
  // Anti-pattern: Fichiers trop volumineux
  const fileSizeThreshold = getThreshold('file-size');
  const largeFiles = glob.sync('**/*.{ts,tsx}', { cwd: ROOT_DIR })
    .filter(file => {
      if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
      const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
      const lineCount = content.split('\n').length;
      return lineCount > fileSizeThreshold;
    });
  
  if (largeFiles.length > 0) {
    detectedPatterns.push({
      ruleId: 'single-responsibility',
      ruleName: 'Principe de responsabilité unique',
      severity: 'medium',
      occurrences: largeFiles.length,
      affectedFiles: largeFiles
    });
  }
  
  // Anti-pattern: Types any
  const filesWithAny = glob.sync('**/*.{ts,tsx}', { cwd: ROOT_DIR })
    .filter(file => {
      if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
      const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
      return /: any/.test(content) || /as any/.test(content);
    });
  
  if (filesWithAny.length > 0) {
    detectedPatterns.push({
      ruleId: 'no-any-types',
      ruleName: 'Pas de types any',
      severity: 'medium',
      occurrences: filesWithAny.length,
      affectedFiles: filesWithAny
    });
  }
  
  // Anti-pattern: Appels directs à l'API Notion
  const directNotionCalls = glob.sync('**/*.{ts,tsx}', { cwd: ROOT_DIR })
    .filter(file => {
      // Exclure les fichiers de services Notion qui sont supposés contenir les appels
      if (file.includes('services/notion/') || file.includes('notion/api/')) return false;
      
      if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
      const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
      return /notion\.api\./.test(content) || /notion\.databases\./.test(content);
    });
  
  if (directNotionCalls.length > 0) {
    detectedPatterns.push({
      ruleId: 'no-direct-notion-api',
      ruleName: 'Pas d\'appel direct à l\'API Notion',
      severity: 'high',
      occurrences: directNotionCalls.length,
      affectedFiles: directNotionCalls
    });
  }
  
  // Anti-pattern: Hooks mal nommés
  const misnamedHooks = glob.sync('hooks/**/*.ts', { cwd: ROOT_DIR })
    .filter(file => {
      const hookName = path.basename(file, '.ts');
      return !hookName.startsWith('use');
    });
  
  if (misnamedHooks.length > 0) {
    detectedPatterns.push({
      ruleId: 'hooks-naming',
      ruleName: 'Nommage des hooks',
      severity: 'medium',
      occurrences: misnamedHooks.length,
      affectedFiles: misnamedHooks
    });
  }
  
  return detectedPatterns;
}

/**
 * Détecte les anti-patterns spécifiques au domaine d'audit
 */
function detectDomainSpecificAntiPatterns(): DetectedAntiPattern[] {
  const detectedPatterns: DetectedAntiPattern[] = [];
  
  // Vérifier la convention de nommage des items de checklist
  const checklistFiles = glob.sync('**/checklist/**/*.{ts,tsx}', { cwd: ROOT_DIR });
  const misnamedChecklistItems = checklistFiles.filter(file => {
    if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    // Vérifier que chaque item de checklist est correctement nommé
    return /const\s+[^C][a-zA-Z]*Item\s+=/.test(content) || 
           /interface\s+[^C][a-zA-Z]*Item/.test(content) ||
           /type\s+[^C][a-zA-Z]*Item\s+=/.test(content);
  });
  
  if (misnamedChecklistItems.length > 0) {
    detectedPatterns.push({
      ruleId: 'checklist-naming-convention',
      ruleName: 'Convention de nommage des items de checklist',
      severity: 'medium',
      occurrences: misnamedChecklistItems.length,
      affectedFiles: misnamedChecklistItems
    });
  }
  
  // Vérifier l'utilisation de fonctions de validation dans les audits
  const auditFiles = glob.sync('**/audit/**/*.{ts,tsx}', { cwd: ROOT_DIR });
  const auditFilesWithoutValidation = auditFiles.filter(file => {
    if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    // Vérifier s'il y a des fonctions de mutation sans validation
    return /create|update|save/.test(content) && 
           !/(validate|checkValid|isValid|validateAudit)/.test(content);
  });
  
  if (auditFilesWithoutValidation.length > 0) {
    detectedPatterns.push({
      ruleId: 'audit-validation',
      ruleName: 'Validation des données d\'audit',
      severity: 'high',
      occurrences: auditFilesWithoutValidation.length,
      affectedFiles: auditFilesWithoutValidation
    });
  }
  
  // Vérifier la gestion des erreurs de connexion à Notion
  const notionFiles = glob.sync('**/notion/**/*.{ts,tsx}', { cwd: ROOT_DIR })
    .filter(file => !file.includes('types.ts')); // Exclure les fichiers de types
  
  const notionFilesWithoutErrorHandling = notionFiles.filter(file => {
    if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    // Vérifier s'il y a des appels à l'API sans gestion d'erreur
    return content.includes('notion.') && 
           !content.includes('try {') && 
           !content.includes('catch (');
  });
  
  if (notionFilesWithoutErrorHandling.length > 0) {
    detectedPatterns.push({
      ruleId: 'notion-connection-error-handling',
      ruleName: 'Gestion des erreurs de connexion Notion',
      severity: 'critical',
      occurrences: notionFilesWithoutErrorHandling.length,
      affectedFiles: notionFilesWithoutErrorHandling
    });
  }
  
  // Vérifier la validation des URLs dans les pages d'échantillon
  const samplePageFiles = glob.sync('**/samplePage/**/*.{ts,tsx}', { cwd: ROOT_DIR });
  const samplePageFilesWithoutUrlValidation = samplePageFiles.filter(file => {
    if (!fs.existsSync(path.join(ROOT_DIR, file))) return false;
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    // Vérifier s'il y a des manipulations d'URL sans validation
    return /url\s*[:=]/.test(content) && 
           !/(isValidUrl|validateUrl|validUrl)/.test(content);
  });
  
  if (samplePageFilesWithoutUrlValidation.length > 0) {
    detectedPatterns.push({
      ruleId: 'sample-page-url-validation',
      ruleName: 'Validation des URLs des pages d\'échantillon',
      severity: 'medium',
      occurrences: samplePageFilesWithoutUrlValidation.length,
      affectedFiles: samplePageFilesWithoutUrlValidation
    });
  }
  
  return detectedPatterns;
}

/**
 * Vérifie les violations de seuils configurés (généraux et par domaine)
 */
function checkThresholdViolations(metrics: ArchitectureMetrics): ThresholdViolation[] {
  const violations: ThresholdViolation[] = [];
  
  // Vérifier les seuils globaux
  const overallThreshold = getThreshold('overall-compliance');
  if (metrics.summary.complianceRate < overallThreshold) {
    violations.push({
      thresholdId: 'overall-compliance',
      thresholdName: 'Conformité globale',
      expectedValue: overallThreshold,
      actualValue: metrics.summary.complianceRate,
      description: `Le taux de conformité (${metrics.summary.complianceRate}%) est inférieur au seuil configuré (${overallThreshold}%)`
    });
  }
  
  // Vérifier le seuil de problèmes critiques
  const criticalCount = metrics.summary.issuesBySeverity['critical'] || 0;
  const criticalThreshold = getThreshold('critical-issues');
  if (criticalCount > criticalThreshold) {
    violations.push({
      thresholdId: 'critical-issues',
      thresholdName: 'Problèmes critiques',
      expectedValue: criticalThreshold,
      actualValue: criticalCount,
      description: `Le nombre de problèmes critiques (${criticalCount}) dépasse le seuil configuré (${criticalThreshold})`
    });
  }
  
  // Vérifier le seuil de problèmes importants
  const highCount = metrics.summary.issuesBySeverity['high'] || 0;
  const highThreshold = getThreshold('high-issues');
  if (highCount > highThreshold) {
    violations.push({
      thresholdId: 'high-issues',
      thresholdName: 'Problèmes importants',
      expectedValue: highThreshold,
      actualValue: highCount,
      description: `Le nombre de problèmes importants (${highCount}) dépasse le seuil configuré (${highThreshold})`
    });
  }
  
  // Vérifier les seuils spécifiques au domaine d'audit
  // Ces vérifications sont spécifiques à notre application d'audit
  
  // Exemple: Taux de complétion des audits
  const auditCompletionRate = calculateAuditCompletionRate();
  const auditCompletionThreshold = getThreshold('audit-completion-rate', 'audit');
  if (auditCompletionRate < auditCompletionThreshold) {
    violations.push({
      thresholdId: 'audit-completion-rate',
      thresholdName: 'Taux de complétion des audits',
      expectedValue: auditCompletionThreshold,
      actualValue: auditCompletionRate,
      description: `Le taux de complétion des audits (${auditCompletionRate}%) est inférieur au seuil configuré (${auditCompletionThreshold}%)`
    });
  }
  
  // Exemple: Taux de correction des actions
  const actionCorrectionRate = calculateActionCorrectionRate();
  const actionCorrectionThreshold = getThreshold('action-correction-rate', 'action');
  if (actionCorrectionRate < actionCorrectionThreshold) {
    violations.push({
      thresholdId: 'action-correction-rate',
      thresholdName: 'Taux de correction des actions',
      expectedValue: actionCorrectionThreshold,
      actualValue: actionCorrectionRate,
      description: `Le taux de correction des actions (${actionCorrectionRate}%) est inférieur au seuil configuré (${actionCorrectionThreshold}%)`
    });
  }
  
  // Autres seuils spécifiques au domaine peuvent être ajoutés ici...
  
  return violations;
}

/**
 * Calcule le taux de complétion des audits (exemple)
 */
function calculateAuditCompletionRate(): number {
  // Dans un cas réel, cette fonction analyserait les données d'audit
  // Pour cet exemple, nous retournons une valeur fixe
  return 85; // 85% de complétion
}

/**
 * Calcule le taux de correction des actions (exemple)
 */
function calculateActionCorrectionRate(): number {
  // Dans un cas réel, cette fonction analyserait les données d'actions correctives
  // Pour cet exemple, nous retournons une valeur fixe
  return 70; // 70% de correction
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
      issuesBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      filesByCategory: {}
    },
    domainDetails: {
      features: [],
      services: [],
      hooks: [],
      components: []
    },
    antiPatterns: {
      detectedPatterns: [],
      thresholdViolations: []
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
  
  // Détecter les anti-patterns généraux
  const generalAntiPatterns = detectGeneralAntiPatterns();
  
  // Détecter les anti-patterns spécifiques au domaine
  const domainSpecificAntiPatterns = detectDomainSpecificAntiPatterns();
  
  // Combiner tous les anti-patterns détectés
  metrics.antiPatterns.detectedPatterns = [...generalAntiPatterns, ...domainSpecificAntiPatterns];
  
  // Ajouter les problèmes liés aux anti-patterns aux issues générales
  for (const pattern of metrics.antiPatterns.detectedPatterns) {
    metrics.issues.push({
      domain: pattern.ruleId.includes('-') ? pattern.ruleId.split('-')[0] : 'anti-patterns',
      category: pattern.ruleId,
      severity: pattern.severity as any,
      description: `${pattern.ruleName} (${pattern.occurrences} occurrences)`
    });
  }
  
  // Calculer le nombre d'issues par sévérité
  for (const issue of metrics.issues) {
    metrics.summary.issuesBySeverity[issue.severity] = 
      (metrics.summary.issuesBySeverity[issue.severity] || 0) + 1;
  }
  
  // Vérifier les violations de seuils
  metrics.antiPatterns.thresholdViolations = checkThresholdViolations(metrics);
  
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
  
  // Afficher le résumé des anti-patterns détectés
  if (metrics.antiPatterns.detectedPatterns.length > 0) {
    console.log(chalk.yellow('\nAnti-patterns détectés:'));
    metrics.antiPatterns.detectedPatterns.forEach(pattern => {
      console.log(`- ${pattern.ruleName}: ${pattern.occurrences} occurrences`);
    });
  }
  
  // Afficher les violations de seuils
  if (metrics.antiPatterns.thresholdViolations.length > 0) {
    console.log(chalk.red('\nViolations de seuils:'));
    metrics.antiPatterns.thresholdViolations.forEach(violation => {
      console.log(`- ${violation.thresholdName}: ${violation.description}`);
    });
  }
}

main();
