
#!/usr/bin/env node

/**
 * Script d'ajout des scripts de sauvegarde à package.json
 * 
 * Ce script ajoute les scripts de sauvegarde à package.json
 * pour permettre leur exécution via npm run.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

function updatePackageJson() {
  console.log('Mise à jour de package.json...');
  
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    // Backup du package.json original
    fs.writeFileSync(`${packageJsonPath}.bak`, content);
    console.log('Sauvegarde de package.json créée.');
    
    // Ajouter ou mettre à jour les scripts
    packageJson.scripts = packageJson.scripts || {};
    
    // Ajouter les nouveaux scripts
    packageJson.scripts['safeguard:setup'] = 'node src/scripts/setup-safeguards.js';
    packageJson.scripts['safeguard:diagnose'] = 'node src/scripts/diagnose-file-headers.js';
    packageJson.scripts['safeguard:fix'] = 'node src/scripts/fix-file-headers.js';
    packageJson.scripts['metadata:verify'] = 'node src/scripts/verify-metadata-files.js';
    
    // Écrire le package.json mis à jour
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json mis à jour avec les scripts de sauvegarde.');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de package.json:', error);
    return false;
  }
}

function main() {
  console.log('=== AJOUT DES SCRIPTS DE SAUVEGARDE ===');
  
  const updated = updatePackageJson();
  
  if (updated) {
    console.log('\n=== INSTALLATION TERMINÉE ===');
    console.log('\nLes scripts de sauvegarde sont maintenant disponibles:');
    console.log('- npm run safeguard:setup : Installe toutes les sauvegardes');
    console.log('- npm run safeguard:diagnose : Diagnostique les problèmes d\'en-tête');
    console.log('- npm run safeguard:fix : Corrige les problèmes d\'en-tête');
    console.log('- npm run metadata:verify : Vérifie les fichiers de métadonnées');
    
    // Exécuter le script d'installation
    try {
      console.log('\nExécution automatique de safeguard:setup...');
      execSync('npm run safeguard:setup', { stdio: 'inherit' });
    } catch (error) {
      console.error('\nErreur lors de l\'exécution de safeguard:setup:', error);
      console.log('\nVous pouvez l\'exécuter manuellement avec: npm run safeguard:setup');
    }
  } else {
    console.error('\n=== ÉCHEC DE L\'INSTALLATION ===');
    console.error('Impossible de mettre à jour package.json.');
  }
}

// Exécuter l'installation
main();
