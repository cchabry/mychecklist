#!/usr/bin/env node
/**
 * Script pour ajouter les commandes npm liées à l'intégration CI/CD
 * 
 * À exécuter manuellement pour ajouter les scripts npm
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = require(packageJsonPath);

// Ajouter les scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "architecture:analysis": "ts-node src/scripts/run-architecture-analysis.ts",
  "architecture:metrics": "ts-node src/scripts/architecture-metrics.ts",
  "architecture:dashboard": "ts-node src/scripts/generate-metrics-dashboard.ts",
  "architecture:serve": "ts-node src/scripts/serve-architecture-dashboard.ts"
};

// Écrire le fichier package.json mis à jour
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Scripts npm pour l\'intégration CI/CD ajoutés avec succès!');
console.log('Vous pouvez maintenant exécuter:');
console.log('  npm run architecture:analysis');
console.log('  npm run architecture:metrics');
console.log('  npm run architecture:dashboard');
console.log('  npm run architecture:serve');
