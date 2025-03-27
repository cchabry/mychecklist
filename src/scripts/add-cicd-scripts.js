
#!/usr/bin/env node
/**
 * Script pour ajouter les commandes npm liées à l'intégration CI/CD
 * 
 * À exécuter manuellement pour ajouter les scripts npm
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../../package.json');

// Lire le fichier package.json
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Ajouter les scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "architecture:analysis": "node src/scripts/run-architecture-analysis.js",
    "architecture:metrics": "node src/scripts/architecture-metrics.js",
    "architecture:dashboard": "node src/scripts/generate-metrics-dashboard.js",
    "architecture:serve": "node src/scripts/serve-architecture-dashboard.js"
  };

  // Écrire le fichier package.json mis à jour
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('Scripts npm pour l\'intégration CI/CD ajoutés avec succès!');
  console.log('Vous pouvez maintenant exécuter:');
  console.log('  npm run architecture:analysis');
  console.log('  npm run architecture:metrics');
  console.log('  npm run architecture:dashboard');
  console.log('  npm run architecture:serve');
} catch (error) {
  console.error('Erreur lors de la modification du fichier package.json:', error);
  process.exit(1);
}
