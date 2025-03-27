
#!/usr/bin/env node

/**
 * Script d'installation des sauvegardes contre les problèmes d'en-tête
 * 
 * Ce script installe tous les mécanismes nécessaires pour éviter
 * les problèmes d'en-tête de fichiers et assurer la cohérence.
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function execScript(scriptPath) {
  try {
    console.log(`\nExécution de ${path.basename(scriptPath)}...`);
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de ${path.basename(scriptPath)}:`, error);
    return false;
  }
}

function main() {
  console.log('=== INSTALLATION DES SAUVEGARDES ===');
  
  // Vérifier que tous les scripts sont exécutables
  const scriptsDir = path.join(__dirname);
  const scripts = [
    path.join(scriptsDir, 'fix-file-headers.js'),
    path.join(scriptsDir, 'verify-metadata-files.js'),
    path.join(scriptsDir, 'install-build-hooks.js')
  ];
  
  // S'assurer que les scripts existent
  for (const script of scripts) {
    if (!fs.existsSync(script)) {
      console.error(`Le script ${path.basename(script)} n'existe pas.`);
      process.exit(1);
    }
  }
  
  // Exécuter les scripts dans l'ordre
  let success = true;
  
  // 1. Vérifier et corriger les fichiers de métadonnées
  success = execScript(scripts[1]) && success;
  
  // 2. Corriger tous les fichiers existants
  success = execScript(scripts[0]) && success;
  
  // 3. Installer les hooks de build
  success = execScript(scripts[2]) && success;
  
  if (success) {
    console.log('\n✅ TOUTES LES SAUVEGARDES ONT ÉTÉ INSTALLÉES AVEC SUCCÈS');
    console.log('\nLe système est maintenant protégé contre les problèmes d\'en-tête de fichiers.');
    console.log('Tous les fichiers seront automatiquement corrigés avant chaque build.');
  } else {
    console.error('\n❌ CERTAINES SAUVEGARDES N\'ONT PAS PU ÊTRE INSTALLÉES');
    console.error('\nCorrigez les erreurs ci-dessus et réessayez.');
  }
}

main();
