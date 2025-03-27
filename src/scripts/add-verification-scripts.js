#!/usr/bin/env node
/**
 * Script pour ajouter les commandes de vérification des phases dans package.json
 * 
 * À exécuter manuellement pour ajouter les scripts npm
 */

import fs from 'fs';
import path from 'path';

const packageJsonPath = path.resolve(__dirname, '../../package.json');

// Lire le fichier package.json
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Ajouter les scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "verify:phase1": "node src/scripts/verify-architecture-phase.js --phase=1",
    "verify:phase2": "node src/scripts/verify-phase2.js",
    "verify:phase3": "node src/scripts/verify-architecture-phase.js --phase=3",
    "verify:current": "node src/scripts/verify-architecture-phase.js",
    "precommit": "npm run verify:current",
    "build:dev": "vite build --mode development"
  };

  // Écrire le fichier package.json mis à jour
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('Scripts de vérification ajoutés avec succès!');
  console.log('Vous pouvez maintenant exécuter:');
  console.log('  npm run verify:phase1');
  console.log('  npm run verify:phase2');
  console.log('  npm run verify:phase3');
  console.log('  npm run verify:current');
  console.log('  npm run build:dev');
  console.log('\nDe plus, le script precommit a été configuré pour exécuter la vérification avant chaque commit.');
} catch (error) {
  console.error('Erreur lors de la modification du fichier package.json:', error);
  process.exit(1);
}
