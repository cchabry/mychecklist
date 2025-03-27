
#!/usr/bin/env node
/**
 * Script de correction globale des fichiers de scripts
 * 
 * Ce script va:
 * 1. Supprimer les lignes vides au début des fichiers
 * 2. Convertir tous les scripts en CommonJS (retirer import/export ES modules)
 * 3. Ajouter le script build:dev manquant
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'src/scripts');

/**
 * Supprime les lignes vides au début d'un fichier
 */
function removeLeadingEmptyLines(filePath) {
  console.log(`Traitement du fichier: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Supprimer les lignes vides au début
    content = content.replace(/^\s*\n+/, '');
    
    // Convertir les imports ES Module en require CommonJS
    content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, 
      (match, imports, source) => {
        const importNames = imports.split(',').map(i => i.trim());
        return `const { ${importNames.join(', ')} } = require('${source}');`;
      });
    
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 
      (match, importName, source) => {
        return `const ${importName} = require('${source}');`;
      });
    
    // Convertir les export ES Module en exports CommonJS
    content = content.replace(/export\s+\{\s*([^}]+)\s*\}/g, 
      (match, exports) => {
        const exportNames = exports.split(',').map(e => e.trim());
        return `module.exports = { ${exportNames.join(', ')} };`;
      });
    
    content = content.replace(/export\s+(\w+)/g, 
      (match, exportName) => {
        return `module.exports.${exportName}`;
      });
    
    // Remplacer import.meta.url
    content = content.replace(/import\.meta\.url/g, '__filename');
    
    // Remplacer fileURLToPath
    content = content.replace(/fileURLToPath\([^)]+\)/g, '__filename');
    
    // Supprimer les import { fileURLToPath } from 'url';
    content = content.replace(/const\s*\{\s*fileURLToPath\s*\}\s*=\s*require\(['"]url['"]\);?/g, '');
    
    // Assurer que le shebang est en première ligne sans ligne vide avant
    if (content.includes('#!/usr/bin/env node')) {
      content = content.replace(/^([\s\S]*?)(#!\/usr\/bin\/env node)/, '$2\n$1');
      content = content.replace(/(#!\/usr\/bin\/env node)\n\n/, '$1\n');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fichier nettoyé: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Erreur lors du traitement du fichier ${filePath}:`, error);
    return false;
  }
}

/**
 * Met à jour les scripts dans package.json
 */
function updatePackageJsonScripts() {
  console.log(`\nMise à jour des scripts dans package.json...`);
  
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    // Ajouter le script build:dev
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['build:dev'] = 'vite build --mode development';
    
    // Ajouter d'autres scripts manquants
    packageJson.scripts['verify:phase1'] = 'node src/scripts/verify-architecture-phase.js --phase=1';
    packageJson.scripts['verify:phase2'] = 'node src/scripts/verify-phase2.js';
    packageJson.scripts['verify:phase3'] = 'node src/scripts/verify-architecture-phase.js --phase=3';
    packageJson.scripts['verify:current'] = 'node src/scripts/verify-architecture-phase.js';
    packageJson.scripts['analyze-architecture'] = 'node src/scripts/analyze-architecture.js';
    packageJson.scripts['architecture:analyze'] = 'node src/scripts/architecture-metrics.js';
    packageJson.scripts['architecture:dashboard'] = 'node src/scripts/generate-metrics-dashboard.js';
    packageJson.scripts['architecture:serve'] = 'node src/scripts/serve-architecture-dashboard.js';
    packageJson.scripts['architecture:full'] = 'node src/scripts/run-architecture-analysis.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✓ Scripts mis à jour dans package.json`);
    return true;
  } catch (error) {
    console.error(`✗ Erreur lors de la mise à jour de package.json:`, error);
    return false;
  }
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('Correction des fichiers de scripts');
  console.log('=================================');
  
  // Récupérer tous les fichiers .js et .ts dans le dossier scripts
  const scriptFiles = glob.sync(path.join(SCRIPTS_DIR, '*.{js,ts}'));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of scriptFiles) {
    if (removeLeadingEmptyLines(file)) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  // Mettre à jour les scripts dans package.json
  updatePackageJsonScripts();
  
  console.log('\nRésumé:');
  console.log(`✓ ${successCount} fichiers traités avec succès`);
  console.log(`✗ ${failCount} fichiers ont échoué`);
  
  if (failCount === 0) {
    console.log('\n✓ Tous les fichiers ont été corrigés avec succès!');
    console.log('\nPour appliquer ces modifications:');
    console.log('1. Exécutez: git add .');
    console.log('2. Puis: git commit -m "Fix: Correction globale des fichiers de scripts"');
    console.log('3. Enfin: git push');
  } else {
    console.log('\n⚠️ Certains fichiers n\'ont pas pu être corrigés. Vérifiez les erreurs ci-dessus.');
  }
}

// Vérifier si le module glob est installé
try {
  require.resolve('glob');
} catch (error) {
  console.error('Le module "glob" est requis mais n\'est pas installé.');
  console.error('Installez-le avec: npm install glob');
  process.exit(1);
}

main();
