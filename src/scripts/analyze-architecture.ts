
#!/usr/bin/env node
/**
 * Script d'analyse architecturale
 * 
 * Ce script analyse la structure du code et vérifie sa conformité
 * avec l'architecture définie. Il identifie les écarts et génère
 * un rapport détaillé.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Chemin principal pour les features
const FEATURES_DIR = path.resolve(__dirname, '../features');

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

// Statistiques globales
const stats = {
  totalFeatures: 0,
  compliantFeatures: 0,
  issues: [] as string[]
};

/**
 * Analyse une feature et vérifie sa conformité
 */
function analyzeFeature(featurePath: string, featureName: string) {
  console.log(chalk.blue(`\nAnalysant la feature: ${featureName}`));
  stats.totalFeatures++;
  
  let isCompliant = true;
  const missingFiles = [];
  
  // Vérifier la présence des fichiers requis
  for (const file of EXPECTED_FEATURE_STRUCTURE) {
    const filePath = path.join(featurePath, file);
    if (!fs.existsSync(filePath)) {
      console.log(chalk.yellow(`  ⚠️ Fichier manquant: ${file}`));
      missingFiles.push(file);
      isCompliant = false;
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
        isCompliant = false;
        stats.issues.push(`${featureName}: Export manquant dans index.ts - ${exportStatement}`);
      }
    }
  }
  
  // Résultat
  if (isCompliant) {
    console.log(chalk.green(`  ✓ La feature ${featureName} est conforme à l'architecture`));
    stats.compliantFeatures++;
  } else {
    console.log(chalk.red(`  ✗ La feature ${featureName} n'est pas conforme à l'architecture`));
    stats.issues.push(`${featureName}: ${missingFiles.length} fichiers manquants`);
  }
  
  return isCompliant;
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Analyse de conformité architecturale'));
  console.log(chalk.gray('=========================================='));
  
  if (!fs.existsSync(FEATURES_DIR)) {
    console.error(chalk.red('Erreur: Le dossier features n\'existe pas.'));
    process.exit(1);
  }
  
  // Analyser chaque feature
  const features = fs.readdirSync(FEATURES_DIR).filter(f => 
    fs.statSync(path.join(FEATURES_DIR, f)).isDirectory()
  );
  
  for (const feature of features) {
    analyzeFeature(path.join(FEATURES_DIR, feature), feature);
  }
  
  // Rapport final
  console.log(chalk.gray('\n=========================================='));
  console.log(chalk.bold('Rapport de conformité architecturale:'));
  console.log(`Total des features: ${stats.totalFeatures}`);
  console.log(`Features conformes: ${stats.compliantFeatures}`);
  console.log(`Taux de conformité: ${Math.round((stats.compliantFeatures / stats.totalFeatures) * 100)}%`);
  
  if (stats.issues.length > 0) {
    console.log(chalk.yellow('\nProblèmes identifiés:'));
    stats.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
}

main();
