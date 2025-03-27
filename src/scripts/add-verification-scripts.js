
#!/usr/bin/env node
/**
 * Script pour ajouter les commandes de vérification des phases dans package.json
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
  "verify:phase1": "ts-node src/scripts/verify-architecture-phase.ts --phase=1",
  "verify:phase2": "ts-node src/scripts/verify-phase2.ts",
  "verify:phase3": "ts-node src/scripts/verify-architecture-phase.ts --phase=3",
  "verify:current": "ts-node src/scripts/verify-architecture-phase.ts",
  "precommit": "npm run verify:current"
};

// Écrire le fichier package.json mis à jour
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Scripts de vérification ajoutés avec succès!');
console.log('Vous pouvez maintenant exécuter:');
console.log('  npm run verify:phase1');
console.log('  npm run verify:phase2');
console.log('  npm run verify:phase3');
console.log('  npm run verify:current');
console.log('\nDe plus, le script precommit a été configuré pour exécuter la vérification avant chaque commit.');
