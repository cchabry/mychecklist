
#!/usr/bin/env node
/**
 * Script d'analyse rapide de l'architecture
 * 
 * Version légère de l'analyse d'architecture, conçue pour être rapide
 * et utilisée dans le hook pre-commit. Analyse uniquement les fichiers modifiés.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { 
  checkFileSize,
  checkForAnyType, 
  checkDirectNotionApiCalls,
  checkHookNaming,
  checkComponentNaming,
  checkFeatureStructure
} from '../utils/architecture/rules';

// Utilisation du chemin root retirée car non utilisée
// const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Récupère la liste des fichiers modifiés dans la staging area
 */
function getModifiedFiles(): string[] {
  try {
    const gitOutput = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    
    // Filtrer pour ne garder que les fichiers .ts/.tsx du dossier src
    return gitOutput
      .split('\n')
      .filter(file => 
        file.startsWith('src/') && 
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.d.ts') && // Exclure les fichiers de déclaration
        fs.existsSync(file)
      );
  } catch (error) {
    console.error(chalk.red('Erreur lors de la récupération des fichiers modifiés:'));
    console.error(error);
    return [];
  }
}

/**
 * Analyse un fichier selon les règles d'architecture
 */
function analyzeFile(filePath: string): string[] {
  const issues: string[] = [];
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Appliquer les règles
  const sizeIssue = checkFileSize(filePath, fileContent);
  if (sizeIssue) issues.push(sizeIssue);
  
  const anyTypeIssues = checkForAnyType(filePath, fileContent);
  issues.push(...anyTypeIssues);
  
  const directApiCallIssues = checkDirectNotionApiCalls(filePath, fileContent);
  issues.push(...directApiCallIssues);
  
  // Règles spécifiques selon le type de fichier
  if (filePath.includes('/hooks/')) {
    const hookIssues = checkHookNaming(filePath);
    if (hookIssues) issues.push(hookIssues);
  }
  
  if (filePath.includes('/components/')) {
    const componentIssues = checkComponentNaming(filePath);
    if (componentIssues) issues.push(componentIssues);
  }
  
  // Vérification de la structure des features
  if (filePath.includes('/features/')) {
    const featureIssues = checkFeatureStructure(filePath);
    issues.push(...featureIssues);
  }
  
  return issues;
}

/**
 * Point d'entrée principal
 */
function main(): void {
  console.log(chalk.bold('Vérification rapide de l\'architecture'));
  console.log(chalk.gray('====================================='));
  
  // Récupérer les fichiers modifiés
  const modifiedFiles = getModifiedFiles();
  
  if (modifiedFiles.length === 0) {
    console.log(chalk.yellow('Aucun fichier TypeScript modifié à analyser.'));
    process.exit(0);
  }
  
  console.log(chalk.blue(`Analyse de ${modifiedFiles.length} fichiers modifiés...`));
  
  // Analyser chaque fichier
  let totalIssues = 0;
  const fileIssues: Record<string, string[]> = {};
  
  modifiedFiles.forEach(file => {
    const issues = analyzeFile(file);
    if (issues.length > 0) {
      fileIssues[file] = issues;
      totalIssues += issues.length;
    }
  });
  
  // Afficher les résultats
  if (totalIssues === 0) {
    console.log(chalk.green('✓ Aucun problème d\'architecture détecté!'));
    process.exit(0);
  } else {
    console.error(chalk.red(`❌ ${totalIssues} problèmes d'architecture détectés:`));
    
    // Afficher les problèmes par fichier
    Object.entries(fileIssues).forEach(([file, issues]) => {
      console.error(chalk.yellow(`\nFichier: ${file}`));
      issues.forEach(issue => {
        console.error(chalk.red(`  • ${issue}`));
      });
    });
    
    console.error(chalk.red('\nVeuillez corriger ces problèmes avant de faire un commit.'));
    process.exit(1);
  }
}

main();
