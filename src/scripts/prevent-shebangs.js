
/**
 * Script de prévention des shebangs
 * 
 * Ce script vérifie l'absence de shebangs dans les fichiers modifiés
 * et échoue si des shebangs sont détectés, empêchant ainsi le commit.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Obtient la liste des fichiers modifiés dans le staging area de git
 */
function getStagedFiles() {
  try {
    // Récupérer uniquement les fichiers .js et .ts qui sont dans le staging area
    const output = execSync('git diff --cached --name-only --diff-filter=ACM | grep -E "\\.(js|ts|jsx|tsx)$"', { 
      cwd: ROOT_DIR,
      encoding: 'utf8'
    });
    
    return output.split('\n').filter(Boolean);
  } catch (error) {
    // En cas d'erreur (par exemple, aucun fichier ne correspond), retourner un tableau vide
    return [];
  }
}

/**
 * Vérifie si un fichier contient un shebang
 */
function checkForShebang(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    return /^\s*#!.*/m.test(content);
  } catch (error) {
    console.error(`Erreur lors de la vérification de ${filePath}:`, error);
    return false;
  }
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('Vérification des shebangs dans les fichiers en attente de commit...');
  
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('Aucun fichier JavaScript/TypeScript en attente de commit.');
    process.exit(0);
  }
  
  console.log(`${stagedFiles.length} fichiers à vérifier.`);
  
  const filesWithShebangs = [];
  
  for (const file of stagedFiles) {
    if (checkForShebang(file)) {
      filesWithShebangs.push(file);
    }
  }
  
  if (filesWithShebangs.length > 0) {
    console.error('\n⛔ ERREUR: Des shebangs ont été détectés dans les fichiers suivants:');
    filesWithShebangs.forEach(file => {
      console.error(`  - ${file}`);
    });
    console.error('\nVeuillez supprimer les shebangs avant de committer.');
    console.error('Vous pouvez utiliser la commande: npm run remove-shebangs');
    process.exit(1);
  } else {
    console.log('✅ Aucun shebang détecté dans les fichiers en attente de commit.');
    process.exit(0);
  }
}

// Exécuter le script
main();
