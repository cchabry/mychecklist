
/**
 * Script d'ajout des outils anti-shebang à package.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');

function updatePackageJson() {
  console.log('Mise à jour de package.json avec les outils anti-shebang...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    
    // Ajouter les scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['remove-shebangs'] = 'node src/scripts/remove-all-shebangs.js';
    packageJson.scripts['prevent-shebangs'] = 'node src/scripts/prevent-shebangs.js';
    
    // S'assurer que le hook pre-commit est correctement configuré
    if (!packageJson.scripts['precommit'] || !packageJson.scripts['precommit'].includes('prevent-shebangs')) {
      const existingPrecommit = packageJson.scripts['precommit'] || '';
      packageJson.scripts['precommit'] = existingPrecommit 
        ? `${existingPrecommit} && npm run prevent-shebangs` 
        : 'npm run prevent-shebangs';
    }
    
    // Écrire les modifications
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
    
    console.log('✅ package.json mis à jour avec succès !');
    console.log('\nCommandes disponibles:');
    console.log('- npm run remove-shebangs : Supprime tous les shebangs des fichiers JS/TS');
    console.log('- npm run prevent-shebangs : Vérifie l\'absence de shebangs avant commit');
    console.log('\nLe hook pre-commit a été configuré pour bloquer les commits contenant des shebangs.');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de package.json:', error);
    return false;
  }
}

// Exécuter la mise à jour
updatePackageJson();
