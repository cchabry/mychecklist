
#!/usr/bin/env node
/**
 * Script pour ajouter les commandes npm dans package.json
 * 
 * À exécuter manuellement pour ajouter les scripts npm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir l'équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../../package.json');

// Lire le fichier package.json
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Ajouter les scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "analyze-architecture": "node src/scripts/analyze-architecture.js",
    "generate-feature": "node src/scripts/generate-feature.js",
    "architecture:analyze": "node src/scripts/architecture-metrics.js",
    "architecture:dashboard": "node src/scripts/generate-metrics-dashboard.js",
    "architecture:serve": "node src/scripts/serve-architecture-dashboard.js",
    "architecture:full": "node src/scripts/run-architecture-analysis.js",
    "architecture:quick": "node src/scripts/quick-architecture-check.js",
    "setup-pre-commit": "node src/scripts/setup-pre-commit.js",
    "vscode:package": "cd vscode-extension && npm run package",
    "architecture:export": "node src/scripts/export-architecture-report.js",
    "architecture:share": "node src/scripts/share-architecture-report.js",
    "architecture:docs": "cp docs/architecture-rules-reference.md reports/architecture-docs.md && echo 'Documentation copiée dans le dossier reports'",
    "build:dev": "vite build --mode development"
  };

  // Écrire le fichier package.json mis à jour
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('Scripts npm ajoutés avec succès!');
  console.log('Vous pouvez maintenant exécuter:');
  console.log('  npm run analyze-architecture');
  console.log('  npm run generate-feature');
  console.log('  npm run architecture:analyze');
  console.log('  npm run architecture:dashboard');
  console.log('  npm run architecture:serve');
  console.log('  npm run architecture:full');
  console.log('  npm run architecture:quick');
  console.log('  npm run setup-pre-commit');
  console.log('  npm run vscode:package');
  console.log('  npm run architecture:export');
  console.log('  npm run architecture:share');
  console.log('  npm run architecture:docs');
  console.log('  npm run build:dev');
} catch (error) {
  console.error('Erreur lors de la modification du fichier package.json:', error);
  process.exit(1);
}
