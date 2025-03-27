#!/usr/bin/env node
/**
 * Script de vérification des phases d'architecture
 * 
 * Ce script vérifie si tous les indicateurs de succès d'une phase spécifique
 * du plan d'alignement architectural sont satisfaits.
 * 
 * Usage: node src/scripts/verify-architecture-phase.js --phase=2
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn, spawnSync } from 'child_process';
import pkg from 'glob';
const { glob } = pkg;

// Chemins principaux
const ROOT_DIR = path.resolve(process.cwd());
const SRC_DIR = path.join(ROOT_DIR, 'src');
const FEATURES_DIR = path.join(SRC_DIR, 'features');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

// Création du répertoire reports s'il n'existe pas
if (!fs.existsSync(REPORTS_DIR)) {
  console.log(chalk.blue('Création du répertoire des rapports...'));
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Patterns attendus pour les exports dans index.ts
const EXPECTED_EXPORTS = {
  feature: [
    /export \* from ['"]\.\/components['"]/,
    /export \* from ['"]\.\/hooks['"]/,
    /export \* from ['"]\.\/types['"]/,
    /export \* from ['"]\.\/utils['"]/,
    /export \* from ['"]\.\/constants['"]/
  ],
  componentIndex: [/export \* from/],
  hookIndex: [/export \{.+\} from/]
};

// Structure attendue pour une feature
const EXPECTED_FEATURE_STRUCTURE = [
  'components',
  'hooks',
  'types.ts',
  'utils.ts',
  'constants.ts',
  'index.ts'
];

// Indicateurs de succès par phase
const PHASE_INDICATORS = {
  1: [
    "Structure des dossiers conforme à l'architecture",
    "Séparation claire des features dans des dossiers dédiés"
  ],
  2: [
    "100% des features suivent la structure de dossiers définie",
    "0 duplication de code utilitaire entre features",
    "Tous les fichiers index.ts respectent les patterns d'export",
    "Tous les tests existants passent"
  ],
  3: [
    "Toutes les features implémentent les interfaces communes",
    "Les nouveaux développements suivent l'architecture cible",
    "Couverture de tests minimale de 70%"
  ]
};

/**
 * Vérification de la structure des dossiers de features
 */
function verifyFeatureStructure() {
  console.log(chalk.blue('\nVérification de la structure des features...'));
  
  let features = [];
  try {
    features = fs.readdirSync(FEATURES_DIR).filter(f => 
      fs.statSync(path.join(FEATURES_DIR, f)).isDirectory()
    );
  } catch (error) {
    console.log(chalk.red(`Erreur lors de la lecture du répertoire des features: ${error.message}`));
    return { success: false, details: [`Erreur: ${error.message}`] };
  }
  
  const details = [];
  let success = true;
  
  for (const feature of features) {
    const featurePath = path.join(FEATURES_DIR, feature);
    const missingItems = [];
    
    for (const item of EXPECTED_FEATURE_STRUCTURE) {
      const itemPath = path.join(featurePath, item);
      if (!fs.existsSync(itemPath)) {
        missingItems.push(item);
      }
    }
    
    if (missingItems.length > 0) {
      success = false;
      details.push(`Feature "${feature}" manque: ${missingItems.join(', ')}`);
    } else {
      details.push(`✓ Feature "${feature}" structure complète`);
    }
  }
  
  if (success) {
    console.log(chalk.green('✓ Toutes les features suivent la structure définie'));
  } else {
    console.log(chalk.red('✗ Certaines features ne suivent pas la structure définie'));
  }
  
  return { success, details };
}

/**
 * Vérification des patterns d'export dans les fichiers index.ts
 */
function verifyExportPatterns() {
  console.log(chalk.blue('\nVérification des patterns d\'export...'));
  
  const details = [];
  let success = true;
  
  // Vérifier les index.ts des features
  try {
    const featureIndexFiles = glob.sync(`${FEATURES_DIR}/*/index.ts`);
    
    for (const indexFile of featureIndexFiles) {
      const feature = path.basename(path.dirname(indexFile));
      const content = fs.readFileSync(indexFile, 'utf8');
      const missingExports = [];
      
      for (const pattern of EXPECTED_EXPORTS.feature) {
        if (!pattern.test(content)) {
          const exportStatement = pattern.toString().replace(/\//g, '');
          missingExports.push(exportStatement);
        }
      }
      
      if (missingExports.length > 0) {
        success = false;
        details.push(`Feature "${feature}" index.ts manque: ${missingExports.join(', ')}`);
      } else {
        details.push(`✓ Feature "${feature}" index.ts conforme`);
      }
    }
    
    // Vérifier les index.ts des components
    const componentIndexFiles = glob.sync(`${FEATURES_DIR}/*/components/index.ts`);
    
    for (const indexFile of componentIndexFiles) {
      const feature = path.basename(path.dirname(path.dirname(indexFile)));
      const content = fs.readFileSync(indexFile, 'utf8');
      
      if (!EXPECTED_EXPORTS.componentIndex.some(pattern => pattern.test(content))) {
        success = false;
        details.push(`Feature "${feature}" components/index.ts non conforme`);
      } else {
        details.push(`✓ Feature "${feature}" components/index.ts conforme`);
      }
    }
    
    // Vérifier les index.ts des hooks
    const hookIndexFiles = glob.sync(`${FEATURES_DIR}/*/hooks/index.ts`);
    
    for (const indexFile of hookIndexFiles) {
      const feature = path.basename(path.dirname(path.dirname(indexFile)));
      const content = fs.readFileSync(indexFile, 'utf8');
      
      if (!EXPECTED_EXPORTS.hookIndex.some(pattern => pattern.test(content))) {
        success = false;
        details.push(`Feature "${feature}" hooks/index.ts non conforme`);
      } else {
        details.push(`✓ Feature "${feature}" hooks/index.ts conforme`);
      }
    }
  } catch (error) {
    console.log(chalk.red(`Erreur lors de la vérification des patterns d'export: ${error.message}`));
    return { success: false, details: [`Erreur: ${error.message}`] };
  }
  
  if (success) {
    console.log(chalk.green('✓ Tous les fichiers index.ts suivent les patterns d\'export'));
  } else {
    console.log(chalk.red('✗ Certains fichiers index.ts ne suivent pas les patterns d\'export'));
  }
  
  return { success, details };
}

/**
 * Vérification de la duplication de code utilitaire
 */
function verifyUtilsDuplication() {
  console.log(chalk.blue('\nVérification de la duplication de code utilitaire...'));
  
  const details = [];
  let success = true;
  
  try {
    // Récupérer tous les fichiers utils.ts des features
    const utilsFiles = glob.sync(`${FEATURES_DIR}/*/utils.ts`);
    
    // Extraire les fonctions exportées
    const exportedFunctions = {};
    const functionSignatures = {};
    
    for (const utilsFile of utilsFiles) {
      const feature = path.basename(path.dirname(utilsFile));
      const content = fs.readFileSync(utilsFile, 'utf8');
      
      exportedFunctions[feature] = new Set();
      
      // Extraire les définitions de fonctions exportées
      const functionMatches = Array.from(content.matchAll(/export (?:const|function) (\w+)/g));
      
      for (const match of functionMatches) {
        const funcName = match[1];
        exportedFunctions[feature].add(funcName);
        
        // Extraire la signature complète de la fonction
        const startIndex = match.index || 0;
        let endIndex = content.indexOf(';', startIndex);
        if (endIndex === -1) {
          // Chercher la fin d'une définition de fonction
          const closingBrace = content.indexOf('}', startIndex);
          if (closingBrace !== -1) {
            endIndex = closingBrace + 1;
          } else {
            endIndex = content.length;
          }
        }
        
        const signature = content.substring(startIndex, endIndex).trim();
        functionSignatures[`${feature}:${funcName}`] = signature;
      }
      
      details.push(`Feature "${feature}": ${exportedFunctions[feature].size} fonctions utilitaires`);
    }
    
    // Vérifier les duplications
    const duplicationMap = {};
    
    for (const feature1 of Object.keys(exportedFunctions)) {
      for (const feature2 of Object.keys(exportedFunctions)) {
        if (feature1 !== feature2) {
          for (const func of Array.from(exportedFunctions[feature1])) {
            if (exportedFunctions[feature2].has(func)) {
              // Comparer les signatures pour vérifier la duplication réelle
              const sig1 = functionSignatures[`${feature1}:${func}`];
              const sig2 = functionSignatures[`${feature2}:${func}`];
              
              if (sig1 && sig2 && areFunctionsSimilar(sig1, sig2)) {
                if (!duplicationMap[func]) {
                  duplicationMap[func] = [];
                }
                
                if (!duplicationMap[func].includes(feature1)) {
                  duplicationMap[func].push(feature1);
                }
                
                if (!duplicationMap[func].includes(feature2)) {
                  duplicationMap[func].push(feature2);
                }
              }
            }
          }
        }
      }
    }
    
    if (Object.keys(duplicationMap).length > 0) {
      success = false;
      
      for (const [func, features] of Object.entries(duplicationMap)) {
        details.push(`Fonction "${func}" dupliquée dans: ${features.join(', ')}`);
      }
    } else {
      details.push('✓ Aucune duplication de fonction utilitaire détectée');
    }
  } catch (error) {
    console.log(chalk.red(`Erreur lors de la vérification de la duplication: ${error.message}`));
    return { success: false, details: [`Erreur: ${error.message}`] };
  }
  
  if (success) {
    console.log(chalk.green('✓ Aucune duplication de code utilitaire entre features'));
  } else {
    console.log(chalk.red('✗ Duplication de code utilitaire détectée entre features'));
  }
  
  return { success, details };
}

/**
 * Vérifie si deux fonctions sont similaires (duplication potentielle)
 */
function areFunctionsSimilar(sig1, sig2) {
  // Simplification pour la démonstration - comparer sans les commentaires et espaces
  const normalize = (sig) => sig
    .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer les commentaires multilignes
    .replace(/\/\/.*/g, '')          // Supprimer les commentaires d'une ligne
    .replace(/\s+/g, ' ')            // Normaliser les espaces
    .trim();
  
  return normalize(sig1) === normalize(sig2);
}

/**
 * Exécution des tests unitaires
 */
function runTests() {
  console.log(chalk.blue('\nExécution des tests unitaires...'));
  
  return new Promise(resolve => {
    const testProcess = spawn('npm', ['test'], { 
      shell: true,
      stdio: 'pipe' 
    });
    
    let output = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });
    
    testProcess.stderr.on('data', (data) => {
      output += data.toString();
      process.stderr.write(data);
    });
    
    testProcess.on('close', (code) => {
      const success = code === 0;
      const details = output.split('\n').filter(Boolean);
      
      if (success) {
        console.log(chalk.green('✓ Tous les tests passent'));
      } else {
        console.log(chalk.red('✗ Certains tests échouent'));
      }
      
      resolve({ success, details });
    });
  });
}

/**
 * Exécution du type-checking
 */
function runTypeChecking() {
  console.log(chalk.blue('\nExécution du type-checking...'));
  
  try {
    const result = spawnSync('npx', ['tsc', '--noEmit'], { 
      shell: true,
      encoding: 'utf8'
    });
    
    const success = result.status === 0;
    const details = result.stdout.split('\n').filter(Boolean);
    
    if (result.stderr) {
      details.push(...result.stderr.split('\n').filter(Boolean));
    }
    
    if (success) {
      console.log(chalk.green('✓ Type-checking réussi'));
    } else {
      console.log(chalk.red('✗ Erreurs de type détectées'));
    }
    
    return { success, details };
  } catch (error) {
    return { 
      success: false, 
      details: [`Erreur lors du type-checking: ${error}`] 
    };
  }
}

/**
 * Génère un rapport HTML pour les résultats de vérification
 */
function generateHtmlReport(results) {
  const totalIndicators = Object.keys(results.results).length;
  const successfulIndicators = Object.values(results.results).filter(r => r.success).length;
  const successRate = Math.round((successfulIndicators / totalIndicators) * 100);
  
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de vérification - Phase ${results.phase}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; color: #333; }
      h1, h2, h3 { color: #2563eb; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
      .success-badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; font-weight: bold; }
      .success-badge.success { background-color: #10b981; color: white; }
      .success-badge.failure { background-color: #ef4444; color: white; }
      .indicator { margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      .indicator-header { display: flex; justify-content: space-between; padding: 12px 16px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
      .indicator-details { padding: 16px; }
      .indicator-status { font-weight: bold; }
      .status-success { color: #10b981; }
      .status-failure { color: #ef4444; }
      .detail-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
      .detail-item:last-child { border-bottom: none; }
      .progress-bar { height: 24px; width: 100%; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden; margin-top: 20px; }
      .progress-value { height: 100%; background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
      .timestamp { color: #6b7280; font-size: 0.875rem; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Rapport de vérification d'architecture</h1>
        <p>Phase ${results.phase} - ${PHASE_INDICATORS[results.phase].join(', ')}</p>
        <p class="timestamp">Généré le ${new Date(results.timestamp).toLocaleString()}</p>
      </div>
      <div class="success-badge ${results.overallSuccess ? 'success' : 'failure'}">
        ${results.overallSuccess ? 'SUCCÈS' : 'ÉCHEC'}
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-value" style="width: ${successRate}%">${successRate}%</div>
    </div>
    
    <h2>Résultats par indicateur</h2>
    
    ${Object.entries(results.results).map(([indicator, result]) => `
      <div class="indicator">
        <div class="indicator-header">
          <h3>${indicator}</h3>
          <span class="indicator-status ${result.success ? 'status-success' : 'status-failure'}">
            ${result.success ? '✓ Succès' : '✗ Échec'}
          </span>
        </div>
        <div class="indicator-details">
          ${result.details.map(detail => `<div class="detail-item">${detail}</div>`).join('')}
        </div>
      </div>
    `).join('')}
    
    <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.875rem;">
      <p>Ce rapport a été généré automatiquement par le script de vérification d'architecture</p>
    </div>
  </body>
  </html>
  `;
}

/**
 * Génère un rapport JSON pour les résultats de vérification
 */
function generateJsonReport(results) {
  return JSON.stringify(results, null, 2);
}

/**
 * Simple fonction pour sauvegarder un rapport de progression
 */
function savePhaseProgressReport() {
  const reportPath = path.join(REPORTS_DIR, 'phase-progress.html');
  const content = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Progression des phases</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
        h1 { color: #2563eb; }
        .phase { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .phase-header { padding: 12px 16px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .phase-body { padding: 16px; }
        .timestamp { color: #6b7280; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <h1>Progression des phases d'architecture</h1>
      <p class="timestamp">Généré le ${new Date().toLocaleString()}</p>
      
      <div class="phase">
        <div class="phase-header">
          <h2>Phase 2</h2>
          <span>${new Date().toLocaleString()}</span>
        </div>
        <div class="phase-body">
          <p>La vérification de la Phase 2 a été exécutée.</p>
          <p>Consultez le rapport détaillé pour plus d'informations.</p>
        </div>
      </div>
      
    </body>
    </html>
  `;
  
  fs.writeFileSync(reportPath, content);
  return reportPath;
}

/**
 * Point d'entrée principal - vérification d'une phase spécifique
 */
async function verifyPhase(phase) {
  console.log(chalk.bold(`\nVérification de la phase ${phase} du plan d'alignement architectural`));
  console.log(chalk.gray('='.repeat(80)));
  
  console.log(chalk.blue(`Indicateurs de succès pour la phase ${phase}:`));
  for (const indicator of PHASE_INDICATORS[phase]) {
    console.log(`  - ${indicator}`);
  }
  
  const results = {};
  
  // Phase 1 & 2: Vérification de la structure des features
  results["Structure des features"] = verifyFeatureStructure();
  
  // Phase 2: Vérification des patterns d'export
  results["Patterns d'export"] = verifyExportPatterns();
  
  // Phase 2: Vérification de la duplication de code
  results["Duplication de code"] = verifyUtilsDuplication();
  
  // Phase 2 & 3: Exécution des tests
  results["Tests unitaires"] = await runTests();
  
  // Toutes phases: Type-checking
  results["Type-checking"] = runTypeChecking();
  
  // Vérifier le succès global
  const overallSuccess = Object.values(results).every(result => result.success);
  
  const phaseResults = {
    phase,
    timestamp: new Date().toISOString(),
    results,
    overallSuccess
  };
  
  // Afficher le résumé
  console.log(chalk.gray('\n='.repeat(80)));
  console.log(chalk.bold('Résumé de la vérification:'));
  
  for (const [indicator, result] of Object.entries(results)) {
    const statusColor = result.success ? chalk.green : chalk.red;
    const statusSymbol = result.success ? '✓' : '✗';
    console.log(`${statusColor(statusSymbol)} ${indicator}: ${result.success ? 'Succès' : 'Échec'}`);
  }
  
  console.log(chalk.gray('\n='.repeat(80)));
  console.log(chalk.bold(`Résultat global: ${overallSuccess ? chalk.green('SUCCÈS') : chalk.red('ÉCHEC')}`));
  
  // Assurer que le répertoire des rapports existe
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Générer les rapports
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/g, '');
  
  const htmlReport = generateHtmlReport(phaseResults);
  fs.writeFileSync(path.join(REPORTS_DIR, `phase${phase}-${timestamp}.html`), htmlReport);
  console.log(chalk.blue(`Rapport HTML généré: ${path.join(REPORTS_DIR, `phase${phase}-${timestamp}.html`)}`));
  
  const jsonReport = generateJsonReport(phaseResults);
  fs.writeFileSync(path.join(REPORTS_DIR, `phase${phase}-${timestamp}.json`), jsonReport);
  console.log(chalk.blue(`Rapport JSON généré: ${path.join(REPORTS_DIR, `phase${phase}-${timestamp}.json`)}`));
  
  // Générer le rapport de progression des phases
  const progressReportPath = savePhaseProgressReport();
  console.log(chalk.blue(`Rapport de progression des phases généré: ${progressReportPath}`));
  
  return phaseResults;
}

/**
 * Analyse les arguments de ligne de commande
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let phase = 2; // Phase par défaut
  
  for (const arg of args) {
    if (arg.startsWith('--phase=')) {
      const phaseStr = arg.split('=')[1];
      const phaseNum = parseInt(phaseStr, 10);
      
      if (!isNaN(phaseNum) && phaseNum > 0 && phaseNum <= 3) {
        phase = phaseNum;
      } else {
        console.warn(chalk.yellow(`Phase invalide: ${phaseStr}. Utilisation de la phase par défaut (2).`));
      }
    }
  }
  
  return { phase };
}

/**
 * Point d'entrée principal
 */
async function main() {
  // Assurer que le répertoire des rapports existe
  if (!fs.existsSync(REPORTS_DIR)) {
    console.log(chalk.blue('Création du répertoire des rapports...'));
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  const { phase } = parseArgs();
  const results = await verifyPhase(phase);
  
  process.exit(results.overallSuccess ? 0 : 1);
}

// Exécuter le script si appelé directement
main().catch(error => {
  console.error(chalk.red('Erreur lors de la vérification:'));
  console.error(error);
  process.exit(1);
});
