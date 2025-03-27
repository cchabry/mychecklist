#!/usr/bin/env node
/**
 * Script de vérification rapide de l'architecture
 * 
 * Version allégée du script d'analyse pour une exécution rapide
 * lors des hooks pre-commit.
 */

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Chemins principaux
// ROOT_DIR est déclaré mais pas utilisé - on le garde pour une utilisation future
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

// Seuils de qualité
// MAX_ISSUES_ALLOWED est supprimé car non utilisé

/**
 * Vérifie les imports interdits
 */
function checkForbiddenImports(): { success: boolean; issues: string[] } {
  console.log(chalk.blue('Vérification des imports interdits...'));
  
  const issues: string[] = [];
  const forbiddenPatterns = [
    { pattern: /from ['"]\.\.\/\.\.\//, message: 'Import remontant de plus d\'un niveau' },
    { pattern: /from ['"]\.\.\/features/, message: 'Import direct entre features' },
    { pattern: /from ['"]\.\.\/pages/, message: 'Import depuis pages' },
  ];
  
  // Parcourir les fichiers de manière récursive
  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        for (const { pattern, message } of forbiddenPatterns) {
          if (pattern.test(content)) {
            const relativePath = path.relative(ROOT_DIR, fullPath);
            issues.push(`${relativePath}: ${message}`);
          }
        }
      }
    }
  }
  
  try {
    scanDirectory(SRC_DIR);
    
    if (issues.length === 0) {
      console.log(chalk.green('✓ Aucun import interdit détecté'));
      return { success: true, issues };
    } else {
      console.log(chalk.yellow(`⚠ ${issues.length} imports interdits détectés`));
      issues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      return { success: false, issues };
    }
  } catch (error) {
    console.error(chalk.red('Erreur lors de la vérification des imports:'));
    console.error(error);
    return { success: false, issues: [`Erreur: ${(error as Error).message}`] };
  }
}

/**
 * Vérifie la structure des dossiers
 */
function checkFolderStructure(): { success: boolean; issues: string[] } {
  console.log(chalk.blue('Vérification de la structure des dossiers...'));
  
  const issues: string[] = [];
  const requiredFolders = [
    'components',
    'features',
    'hooks',
    'services',
    'types',
    'utils',
    'pages'
  ];
  
  try {
    for (const folder of requiredFolders) {
      const folderPath = path.join(SRC_DIR, folder);
      if (!fs.existsSync(folderPath)) {
        issues.push(`Dossier manquant: ${folder}`);
      }
    }
    
    if (issues.length === 0) {
      console.log(chalk.green('✓ Structure des dossiers conforme'));
      return { success: true, issues };
    } else {
      console.log(chalk.yellow(`⚠ ${issues.length} problèmes de structure détectés`));
      issues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      return { success: false, issues };
    }
  } catch (error) {
    console.error(chalk.red('Erreur lors de la vérification de la structure:'));
    console.error(error);
    return { success: false, issues: [`Erreur: ${(error as Error).message}`] };
  }
}

/**
 * Vérifie les fichiers placés au mauvais endroit
 */
function checkMisplacedFiles(): { success: boolean; issues: string[] } {
  console.log(chalk.blue('Vérification des fichiers mal placés...'));
  
  const issues: string[] = [];
  
  // Règles de placement des fichiers
  const rules = [
    { dir: 'components', pattern: /\.(tsx|jsx)$/, message: 'Les composants doivent être des fichiers .tsx ou .jsx' },
    { dir: 'hooks', pattern: /^use[A-Z].*\.tsx?$/, message: 'Les hooks doivent commencer par "use" et être des fichiers .ts ou .tsx' },
    { dir: 'services', pattern: /Service\.ts$/, message: 'Les services doivent se terminer par "Service.ts"' },
    { dir: 'utils', pattern: /\.ts$/, message: 'Les utilitaires doivent être des fichiers .ts' }
  ];
  
  try {
    for (const rule of rules) {
      const dirPath = path.join(SRC_DIR, rule.dir);
      if (fs.existsSync(dirPath)) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isFile() && !rule.pattern.test(entry.name)) {
            issues.push(`${rule.dir}/${entry.name}: ${rule.message}`);
          }
        }
      }
    }
    
    if (issues.length === 0) {
      console.log(chalk.green('✓ Aucun fichier mal placé détecté'));
      return { success: true, issues };
    } else {
      console.log(chalk.yellow(`⚠ ${issues.length} fichiers mal placés détectés`));
      issues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      return { success: false, issues };
    }
  } catch (error) {
    console.error(chalk.red('Erreur lors de la vérification des fichiers mal placés:'));
    console.error(error);
    return { success: false, issues: [`Erreur: ${(error as Error).message}`] };
  }
}

/**
 * Génère un rapport de vérification rapide
 */
function generateQuickReport(results: Array<{ success: boolean; issues: string[] }>): void {
  // Créer le répertoire des rapports s'il n'existe pas
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  const allIssues = results.flatMap(result => result.issues);
  const success = results.every(result => result.success);
  
  const report = {
    timestamp: new Date().toISOString(),
    success,
    issueCount: allIssues.length,
    issues: allIssues
  };
  
  const reportPath = path.join(REPORTS_DIR, 'quick-check.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(chalk.blue(`Rapport de vérification rapide généré: ${reportPath}`));
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Vérification rapide de l\'architecture'));
  console.log(chalk.gray('====================================='));
  
  const results = [
    checkForbiddenImports(),
    checkFolderStructure(),
    checkMisplacedFiles()
  ];
  
  generateQuickReport(results);
  
  const success = results.every(result => result.success);
  
  if (success) {
    console.log(chalk.green('\n✓ Vérification rapide réussie!'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n✗ Vérification rapide échouée!'));
    console.log(chalk.yellow('Consultez le rapport pour plus de détails.'));
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}
