
#!/usr/bin/env node
/**
 * Script pour ajouter les commandes npm dans package.json
 * 
 * À exécuter manuellement pour ajouter les scripts npm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    "analyze-architecture": "ts-node src/scripts/analyze-architecture.ts",
    "generate-feature": "ts-node src/scripts/generate-feature.ts",
    "architecture:analyze": "ts-node src/scripts/architecture-metrics.ts",
    "architecture:dashboard": "ts-node src/scripts/generate-metrics-dashboard.ts",
    "architecture:serve": "ts-node src/scripts/serve-architecture-dashboard.ts",
    "architecture:full": "ts-node src/scripts/run-architecture-analysis.ts",
    "architecture:quick": "ts-node src/scripts/quick-architecture-check.ts",
    "setup-pre-commit": "ts-node src/scripts/setup-pre-commit.ts",
    "vscode:package": "cd vscode-extension && npm run package",
    "architecture:export": "ts-node src/scripts/export-architecture-report.ts",
    "architecture:share": "ts-node src/scripts/share-architecture-report.ts",
    "architecture:docs": "cp docs/architecture-rules-reference.md reports/architecture-docs.md && echo 'Documentation copiée dans le dossier reports'"
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
} catch (error) {
  console.error('Erreur lors de la modification du fichier package.json:', error);
  process.exit(1);
}
