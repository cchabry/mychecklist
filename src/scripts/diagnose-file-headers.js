
#!/usr/bin/env node

/**
 * Script de diagnostic des en-têtes de fichiers
 * 
 * Ce script examine le début des fichiers pour identifier les caractères exacts 
 * présents, afin de diagnostiquer le problème des lignes vides.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'glob';
const { glob } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Fonction pour afficher les caractères exacts au début d'un fichier
function examineFileHeader(filePath) {
  console.log(`\nExamen du fichier: ${filePath}`);
  
  try {
    // Lire le début du fichier en tant que Buffer pour voir les octets exacts
    const buffer = fs.readFileSync(filePath);
    const headerBytes = buffer.slice(0, 20); // Examiner les 20 premiers octets
    
    console.log('Octets de l\'en-tête (hex):');
    console.log(headerBytes.toString('hex'));
    
    console.log('Représentation des caractères:');
    for (let i = 0; i < Math.min(headerBytes.length, 20); i++) {
      const byte = headerBytes[i];
      let char = String.fromCharCode(byte);
      if (byte === 10) char = '\\n';
      if (byte === 13) char = '\\r';
      if (byte === 9) char = '\\t';
      if (byte < 32 && byte !== 10 && byte !== 13 && byte !== 9) {
        char = `\\x${byte.toString(16).padStart(2, '0')}`;
      }
      console.log(`Position ${i}: ${byte} (${char})`);
    }
    
    console.log('Les 20 premiers caractères:');
    console.log(JSON.stringify(buffer.slice(0, 20).toString()));
    
    return buffer[0] === 10; // Retourne true si le premier octet est un saut de ligne (\n)
  } catch (error) {
    console.error(`Erreur lors de l'examen du fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction pour examiner un ensemble de fichiers
function examineFiles(pattern) {
  console.log(`\nRecherche de fichiers correspondant au modèle: ${pattern}`);
  
  try {
    const files = glob.sync(pattern, { 
      ignore: '**/node_modules/**',
      absolute: true
    });
    
    console.log(`${files.length} fichiers trouvés`);
    
    let filesWithNewlineStart = 0;
    
    for (const file of files) {
      const hasNewlineStart = examineFileHeader(file);
      if (hasNewlineStart) {
        filesWithNewlineStart++;
      }
    }
    
    console.log(`\nRésumé: ${filesWithNewlineStart} fichiers sur ${files.length} commencent par un saut de ligne`);
    
    return filesWithNewlineStart;
  } catch (error) {
    console.error('Erreur lors de la recherche des fichiers:', error);
    return 0;
  }
}

// Fonction pour tester notre hypothèse sur le processus d'écriture de fichiers
function testFileWriting() {
  console.log('\n=== TEST D\'ÉCRITURE DE FICHIERS ===');
  
  const testDir = path.join(ROOT_DIR, 'temp-test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Test 1: Écriture simple
  const test1Path = path.join(testDir, 'test1.txt');
  const content1 = 'Première ligne\nDeuxième ligne';
  fs.writeFileSync(test1Path, content1);
  console.log('\nTest 1: Écriture simple');
  examineFileHeader(test1Path);
  
  // Test 2: Écriture avec préfixe shebang
  const test2Path = path.join(testDir, 'test2.txt');
  const content2 = '#!/usr/bin/env node\nPremière ligne';
  fs.writeFileSync(test2Path, content2);
  console.log('\nTest 2: Écriture avec shebang');
  examineFileHeader(test2Path);
  
  // Test 3: Lecture puis écriture
  const test3Path = path.join(testDir, 'test3.txt');
  fs.writeFileSync(test3Path, content1);
  const readContent = fs.readFileSync(test3Path, 'utf8');
  fs.writeFileSync(test3Path, readContent);
  console.log('\nTest 3: Lecture puis écriture');
  examineFileHeader(test3Path);
  
  // Nettoyage
  try {
    fs.rmSync(testDir, { recursive: true });
    console.log('\nRépertoire de test supprimé');
  } catch (error) {
    console.error('Erreur lors de la suppression du répertoire de test:', error);
  }
}

// Fonction principale
function main() {
  console.log('=== DIAGNOSTIC DES EN-TÊTES DE FICHIERS ===');
  
  // Examiner les fichiers scripts
  console.log('\n--- FICHIERS SCRIPTS ---');
  examineFiles(path.join(ROOT_DIR, 'src/scripts/*.{js,ts}'));
  
  // Examiner les fichiers service
  console.log('\n--- FICHIERS SERVICE ---');
  examineFiles(path.join(ROOT_DIR, 'src/services/**/*.{js,ts}'));
  
  // Examiner un échantillon d'autres fichiers
  console.log('\n--- AUTRES FICHIERS ---');
  examineFiles(path.join(ROOT_DIR, 'src/hooks/**/*.{js,ts}'));
  
  // Tester le processus d'écriture de fichiers
  testFileWriting();

  // Examinons également un fichier que nous venons de créer
  console.log('\n--- CE FICHIER DE DIAGNOSTIC ---');
  examineFileHeader(__filename);
  
  console.log('\n=== FIN DU DIAGNOSTIC ===');
}

// Exécuter le diagnostic
main();
