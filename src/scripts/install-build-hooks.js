
#!/usr/bin/env node

/**
 * Script d'installation des hooks de build
 * 
 * Ce script modifie le package.json pour ajouter des hooks pre-build
 * qui corrigeront automatiquement les problèmes d'en-tête de fichiers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

function updatePackageJson() {
  console.log('Mise à jour de package.json pour ajouter les hooks de build...');
  
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    // Backup du package.json original
    fs.writeFileSync(`${packageJsonPath}.bak`, content);
    console.log('Sauvegarde de package.json créée.');
    
    // Ajouter ou mettre à jour les scripts
    packageJson.scripts = packageJson.scripts || {};
    
    // Scripts de diagnostic et de correction
    packageJson.scripts['diagnose:headers'] = 'node src/scripts/diagnose-file-headers.js';
    packageJson.scripts['fix:headers'] = 'node src/scripts/fix-file-headers.js';
    
    // Hook pour le pré-build: corriger les en-têtes avant la construction
    packageJson.scripts['prebuild'] = 'npm run fix:headers';
    packageJson.scripts['predev'] = 'npm run fix:headers';
    
    // S'assurer que le hook est aussi exécuté avant build:dev
    if (packageJson.scripts['build:dev']) {
      packageJson.scripts['prebuild:dev'] = 'npm run fix:headers';
    }
    
    // Écrire le package.json mis à jour
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json mis à jour avec les hooks de build.');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de package.json:', error);
    return false;
  }
}

function testHooks() {
  console.log('\nTest des hooks installés...');
  
  try {
    // Exécuter le script de diagnostic pour voir l'état actuel
    console.log('\n--- ÉTAT INITIAL ---');
    execSync('npm run diagnose:headers', { stdio: 'inherit' });
    
    // Exécuter le correcteur
    console.log('\n--- EXÉCUTION DE LA CORRECTION ---');
    execSync('npm run fix:headers', { stdio: 'inherit' });
    
    // Vérifier que les corrections ont été appliquées
    console.log('\n--- ÉTAT APRÈS CORRECTION ---');
    execSync('npm run diagnose:headers', { stdio: 'inherit' });
    
    console.log('\nTests des hooks terminés.');
    return true;
  } catch (error) {
    console.error('Erreur lors du test des hooks:', error);
    return false;
  }
}

function main() {
  console.log('=== INSTALLATION DES HOOKS DE BUILD ===');
  
  const updated = updatePackageJson();
  
  if (updated) {
    testHooks();
    
    console.log('\n=== INSTALLATION TERMINÉE ===');
    console.log('\nLes hooks de build sont maintenant installés.');
    console.log('Tous les fichiers scripts seront automatiquement corrigés avant chaque build.');
    console.log('\nCommandes disponibles:');
    console.log('- npm run diagnose:headers : Examine les fichiers et affiche les problèmes d\'en-tête');
    console.log('- npm run fix:headers : Corrige manuellement tous les fichiers');
  } else {
    console.error('\n=== ÉCHEC DE L\'INSTALLATION ===');
    console.error('Impossible de mettre à jour package.json.');
  }
}

// Exécuter l'installation
main();
