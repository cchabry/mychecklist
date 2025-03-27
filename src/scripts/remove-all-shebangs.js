
/**
 * Script de suppression systématique des shebangs
 * 
 * Ce script parcourt tous les fichiers JavaScript et TypeScript du projet
 * et supprime tous les shebangs qu'il trouve au début des fichiers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'glob';
const { glob } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Supprime les shebangs d'un fichier
 */
function removeShebangs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier s'il y a un shebang au début du fichier
    const hasShebang = /^\s*#!.*/m.test(content);
    
    if (hasShebang) {
      console.log(`🔍 Shebang détecté dans: ${filePath}`);
      
      // Supprimer tous les shebangs
      const newContent = content.replace(/^\s*#!.*\n?/m, '');
      
      // Écrire le fichier nettoyé
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Shebang supprimé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error);
    return false;
  }
}

/**
 * Recherche et supprime tous les shebangs dans les fichiers du projet
 */
function removeAllShebangs() {
  console.log('🔎 Recherche de tous les fichiers avec shebangs...');
  
  // Pattern pour trouver tous les fichiers JS et TS dans le projet
  const filePattern = path.join(ROOT_DIR, 'src/**/*.{js,ts,jsx,tsx}');
  
  try {
    const files = glob.sync(filePattern, { 
      ignore: '**/node_modules/**',
      absolute: true 
    });
    
    console.log(`📁 ${files.length} fichiers trouvés à analyser`);
    
    let shebangsRemoved = 0;
    let filesWithShebangs = 0;
    
    // Traiter chaque fichier
    for (const file of files) {
      if (removeShebangs(file)) {
        filesWithShebangs++;
        shebangsRemoved++;
      }
    }
    
    if (filesWithShebangs > 0) {
      console.log(`\n✅ Terminé: ${shebangsRemoved} shebangs supprimés dans ${filesWithShebangs} fichiers.`);
    } else {
      console.log(`\n✅ Aucun shebang trouvé dans les ${files.length} fichiers analysés.`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
removeAllShebangs();
