
/**
 * Script de nettoyage pour supprimer les fichiers obsolètes après migration
 * Exécuter avec: node scripts/cleanup.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Mode simulation (true = ne supprime pas réellement les fichiers)
  dryRun: true,
  
  // Répertoires à scanner
  directories: [
    'src/lib/notionProxy',
    'src/hooks',
    'src/components',
    'src/contexts',
    'src/services'
  ],
  
  // Fichiers et dossiers spécifiquement obsolètes
  obsoleteFiles: [
    // Ancien système mock
    'src/lib/notionProxy/mock/mode.ts',
    'src/lib/notionProxy/mock/state.ts',
    'src/lib/notionProxy/mock/utils.ts',
    
    // Anciennes implémentations CORS
    'src/lib/notionProxy/corsProxies.ts',
    'src/lib/notionProxy/corsManager.ts',
    
    // Hooks obsolètes
    'src/hooks/useMockMode.ts',
    'src/hooks/useNotionMockData.ts',
    'src/hooks/useNotionRequest.ts',
    
    // Composants remplacés
    'src/components/NotionConnectionStatus.tsx',
    'src/components/MockModeToggle.tsx',
    'src/components/CorsProxyConfig.tsx'
  ],
  
  // Extensions de fichiers à traiter
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.md']
};

/**
 * Recherche les imports obsolètes dans les fichiers
 */
const findObsoleteImports = (filePath, content) => {
  // Patterns d'imports obsolètes
  const patterns = [
    // Imports directs des modules obsolètes
    { pattern: /from ['"]@\/lib\/notionProxy\/mock\/mode['"]/g, name: "import de mockMode" },
    { pattern: /from ['"]@\/lib\/notionProxy\/mock\/state['"]/g, name: "import de mockState" },
    { pattern: /from ['"]@\/lib\/notionProxy\/mock\/utils['"]/g, name: "import de mockUtils" },
    { pattern: /from ['"]@\/hooks\/useMockMode['"]/g, name: "import de useMockMode" },
    { pattern: /from ['"]@\/hooks\/useNotionMockData['"]/g, name: "import de useNotionMockData" },
    { pattern: /from ['"]@\/hooks\/useNotionRequest['"]/g, name: "import de useNotionRequest" },
    
    // Imports indirects ou plus général (à traiter avec précaution)
    { pattern: /from ['"]@\/lib\/notionProxy['"]/g, name: "import de notionProxy" },
  ];
  
  const findings = [];
  
  // Vérifier chaque motif
  patterns.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      findings.push({
        file: filePath,
        import: name,
        pattern: pattern.toString()
      });
    }
  });
  
  return findings;
};

/**
 * Supprime les fichiers obsolètes
 */
const removeObsoleteFiles = () => {
  let deleted = 0;
  let skipped = 0;
  
  CONFIG.obsoleteFiles.forEach(filePath => {
    const absolutePath = path.resolve(filePath);
    
    if (fs.existsSync(absolutePath)) {
      if (CONFIG.dryRun) {
        console.log(`[SIMULATION] Suppression de: ${filePath}`);
        skipped++;
      } else {
        try {
          fs.unlinkSync(absolutePath);
          console.log(`✓ Supprimé: ${filePath}`);
          deleted++;
        } catch (error) {
          console.error(`✗ Erreur lors de la suppression de ${filePath}:`, error.message);
        }
      }
    } else {
      console.log(`? Fichier déjà supprimé: ${filePath}`);
    }
  });
  
  return { deleted, skipped };
};

/**
 * Parcours un répertoire à la recherche d'imports obsolètes
 */
const scanDirectory = (directory) => {
  const findings = [];
  
  const scanRecursive = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Récursion dans les sous-répertoires
        scanRecursive(filePath);
      } else if (stat.isFile() && CONFIG.extensions.includes(path.extname(filePath))) {
        // Traiter les fichiers avec les extensions spécifiées
        const content = fs.readFileSync(filePath, 'utf8');
        const fileFindings = findObsoleteImports(filePath, content);
        
        if (fileFindings.length > 0) {
          findings.push(...fileFindings);
        }
      }
    });
  };
  
  try {
    scanRecursive(directory);
  } catch (error) {
    console.error(`Erreur lors du scan de ${directory}:`, error.message);
  }
  
  return findings;
};

/**
 * Point d'entrée principal
 */
const main = () => {
  console.log('=== Nettoyage du code obsolète ===');
  console.log(`Mode: ${CONFIG.dryRun ? 'SIMULATION (dry-run)' : 'RÉEL'}\n`);
  
  // 1. Supprimer les fichiers obsolètes
  console.log('--- Suppression des fichiers obsolètes ---');
  const { deleted, skipped } = removeObsoleteFiles();
  console.log(`\nRésultat: ${deleted} fichiers supprimés, ${skipped} fichiers simulés\n`);
  
  // 2. Trouver les imports obsolètes restants
  console.log('--- Recherche des imports obsolètes ---');
  const allFindings = [];
  
  CONFIG.directories.forEach(dir => {
    const dirPath = path.resolve(dir);
    if (fs.existsSync(dirPath)) {
      const findings = scanDirectory(dirPath);
      allFindings.push(...findings);
    } else {
      console.warn(`Répertoire non trouvé: ${dir}`);
    }
  });
  
  // 3. Afficher un rapport des imports obsolètes
  if (allFindings.length > 0) {
    console.log('\n--- Imports obsolètes trouvés ---');
    const groupedFindings = {};
    
    allFindings.forEach(finding => {
      if (!groupedFindings[finding.file]) {
        groupedFindings[finding.file] = [];
      }
      groupedFindings[finding.file].push(finding.import);
    });
    
    Object.keys(groupedFindings).forEach(file => {
      console.log(`\n${file}:`);
      groupedFindings[file].forEach(importName => {
        console.log(`  - ${importName}`);
      });
    });
    
    console.log('\nCes imports doivent être remplacés selon le guide de migration.');
  } else {
    console.log('\nAucun import obsolète trouvé. Migration complète!');
  }
};

// Exécuter le script
main();
