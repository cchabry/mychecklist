
#!/usr/bin/env node
/**
 * Script de correction globale des fichiers de scripts
 * 
 * Ce script va:
 * 1. Supprimer les lignes vides au début des fichiers
 * 2. Convertir tous les scripts en ES Modules (utiliser import/export)
 * 3. Ajouter le script build:dev manquant
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Importer glob correctement en tant que module ES
import pkg from 'glob';
const { glob } = pkg;

// Chemins principaux
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    
    // Convertir les requires CommonJS en import ES Module
    content = content.replace(/const\s*\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
      (match, imports, source) => {
        const importNames = imports.split(',').map(i => i.trim());
        return `import { ${importNames.join(', ')} } from '${source}';`;
      });
    
    content = content.replace(/const\s*(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
      (match, importName, source) => {
        return `import ${importName} from '${source}';`;
      });
    
    // Convertir les module.exports CommonJS en export ES Module
    content = content.replace(/module\.exports\s*=\s*\{\s*([^}]+)\s*\};?/g, 
      (match, exports) => {
        const exportNames = exports.split(',').map(e => e.trim());
        return `export { ${exportNames.join(', ')} };`;
      });
    
    content = content.replace(/module\.exports\.(\w+)/g, 
      (match, exportName) => {
        return `export ${exportName}`;
      });
    
    // Ne pas remplacer l'expression fileURLToPath car on l'utilise déjà correctement
    // content = content.replace(/fileURLToPath\(import\.meta\.url\)/g, "fileURLToPath(import.meta.url)");
    
    // Ajouter import { fileURLToPath } from 'url' si nécessaire
    if (content.includes('fileURLToPath(import.meta.url)') && !content.includes("import { fileURLToPath }")) {
      content = "import { fileURLToPath } from 'url';\n" + content;
    }
    
    // Gérer spécifiquement l'import de glob (problématique)
    if (content.includes("from 'glob';") && !content.includes("const { glob } = pkg;")) {
      content = content.replace(
        "import { glob } from 'glob';", 
        "import pkg from 'glob';\nconst { glob } = pkg;"
      );
    }
    
    // Corriger les references à __dirname
    if (content.includes("__dirname") && !content.includes("const __dirname = path.dirname(__filename);")) {
      // S'assurer que nous avons les imports nécessaires
      if (!content.includes("import { fileURLToPath } from 'url';")) {
        content = "import { fileURLToPath } from 'url';\n" + content;
      }
      if (!content.includes("import path from 'path';")) {
        content = "import path from 'path';\n" + content;
      }
      
      // Ajouter la déclaration de __dirname
      const dirnameDeclaration = "const __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n";
      
      // Si le fichier a un shebang, l'insérer après
      if (content.includes("#!/usr/bin/env node")) {
        content = content.replace("#!/usr/bin/env node\n", "#!/usr/bin/env node\n" + dirnameDeclaration);
      } else {
        // Sinon, insérer après les imports
        const lastImportIndex = content.lastIndexOf("import ");
        const lastImportLineEnd = content.indexOf("\n", lastImportIndex);
        if (lastImportIndex !== -1 && lastImportLineEnd !== -1) {
          content = content.substring(0, lastImportLineEnd + 1) + "\n" + dirnameDeclaration + content.substring(lastImportLineEnd + 1);
        } else {
          content = dirnameDeclaration + content;
        }
      }
    }
    
    // Assurer que le shebang est en première ligne sans ligne vide avant
    if (content.includes('#!/usr/bin/env node')) {
      content = content.replace(/^([\s\S]*?)(#!\/usr\/bin\/env node)/, '$2\n$1');
      content = content.replace(/(#!\/usr\/bin\/env node)\n\n/, '$1\n');
      content = content.replace(/(#!\/usr\/bin\/env node\n)(import[\s\S]*?)(\n\n)(const __filename)/, '$1$2\n$4');
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

// Exécuter le script
main();
