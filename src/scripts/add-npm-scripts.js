
/**
 * Script pour ajouter les commandes npm dans package.json
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
  "analyze-architecture": "ts-node src/scripts/analyze-architecture.ts",
  "generate-feature": "ts-node src/scripts/generate-feature.ts"
};

// Écrire le fichier package.json mis à jour
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Scripts npm ajoutés avec succès!');
console.log('Vous pouvez maintenant exécuter:');
console.log('  npm run analyze-architecture');
console.log('  npm run generate-feature');
