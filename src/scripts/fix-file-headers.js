
/**
 * Script de correction des en-têtes de fichiers
 * 
 * Ce script détecte et corrige automatiquement les problèmes d'en-tête de fichiers,
 * notamment les lignes vides au début et les shebangs incorrectement positionnés.
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
 * Corrige l'en-tête d'un fichier en supprimant les lignes vides au début
 * et en supprimant complètement les shebangs
 */
function fixFileHeader(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalSize = content.length;
    
    // Supprimer tous les caractères invisibles et lignes vides au début du fichier
    content = content.replace(/^[\s\u200B\u200C\u200D\uFEFF\xA0\r\n]+/g, '');
    
    // Supprimer les shebangs, peu importe leur position
    content = content.replace(/^\s*#!\/usr\/bin\/env node\s*[\r\n]*/m, '');
    
    // Éviter les opérations inutiles d'écriture sur disque
    const newSize = content.length;
    if (originalSize !== newSize || content[0] === '\n') {
      // Buffer direct sans encodage pour éviter les transformations
      const buffer = Buffer.from(content);
      fs.writeFileSync(filePath, buffer);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la correction de l'en-tête du fichier ${filePath}:`, error);
    return false;
  }
}

/**
 * Corrige tous les fichiers correspondant à un motif
 */
function fixFiles(pattern) {
  try {
    const files = glob.sync(pattern, { 
      ignore: '**/node_modules/**',
      absolute: true
    });
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        const wasFixed = fixFileHeader(file);
        if (wasFixed) {
          fixedCount++;
          console.log(`✓ Fichier corrigé: ${file}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ Erreur de correction: ${file}`, error);
      }
    }
    
    console.log(`\n${fixedCount} fichiers corrigés sur ${files.length} (${errorCount} erreurs)`);
    return { total: files.length, fixed: fixedCount, errors: errorCount };
  } catch (error) {
    console.error('Erreur lors de la recherche des fichiers:', error);
    return { total: 0, fixed: 0, errors: 1 };
  }
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('=== CORRECTION DES EN-TÊTES DE FICHIERS ===');
  
  // Corriger les fichiers scripts (.js et .ts)
  console.log('\n--- FICHIERS SCRIPTS ---');
  fixFiles(path.join(ROOT_DIR, 'src/scripts/*.{js,ts}'));
  
  // Corriger les fichiers services
  console.log('\n--- FICHIERS SERVICES ---');
  fixFiles(path.join(ROOT_DIR, 'src/services/**/*.{js,ts}'));
  
  // Corriger les fichiers hooks
  console.log('\n--- FICHIERS HOOKS ---');
  fixFiles(path.join(ROOT_DIR, 'src/hooks/**/*.{js,ts}'));
  
  // Corriger les fichiers utils
  console.log('\n--- FICHIERS UTILS ---');
  fixFiles(path.join(ROOT_DIR, 'src/utils/**/*.{js,ts}'));
  
  // Corriger les fichiers features
  console.log('\n--- FICHIERS FEATURES ---');
  fixFiles(path.join(ROOT_DIR, 'src/features/**/*.{js,ts}'));
  
  console.log('\n=== CORRECTION TERMINÉE ===');
}

// Exécuter la correction
main();
