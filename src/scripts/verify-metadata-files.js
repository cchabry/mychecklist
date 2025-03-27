
#!/usr/bin/env node

/**
 * Script de vérification des fichiers de métadonnées
 * 
 * Ce script vérifie et corrige les fichiers de configuration importants
 * qui pourraient influencer le formatage des fichiers source.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Vérifier et corriger le fichier .prettierrc
function verifyPrettierrc() {
  console.log('Vérification de .prettierrc...');
  
  const prettierrcPath = path.join(ROOT_DIR, '.prettierrc');
  
  if (!fs.existsSync(prettierrcPath)) {
    console.log('.prettierrc non trouvé, création...');
    
    const prettierConfig = {
      "semi": true,
      "tabWidth": 2,
      "printWidth": 100,
      "singleQuote": true,
      "trailingComma": "es5",
      "jsxBracketSameLine": false,
      "arrowParens": "avoid",
      "endOfLine": "auto",
      "insertPragma": false,
      "requirePragma": false
    };
    
    fs.writeFileSync(prettierrcPath, JSON.stringify(prettierConfig, null, 2));
    console.log('.prettierrc créé avec succès.');
  } else {
    try {
      const content = fs.readFileSync(prettierrcPath, 'utf8');
      const config = JSON.parse(content);
      
      // S'assurer que ces options sont désactivées
      let updated = false;
      
      if (config.insertPragma !== false) {
        config.insertPragma = false;
        updated = true;
      }
      
      if (config.requirePragma !== false) {
        config.requirePragma = false;
        updated = true;
      }
      
      if (config.proseWrap !== 'preserve') {
        config.proseWrap = 'preserve';
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(prettierrcPath, JSON.stringify(config, null, 2));
        console.log('.prettierrc mis à jour.');
      } else {
        console.log('.prettierrc est déjà correctement configuré.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de .prettierrc:', error);
    }
  }
}

// Vérifier et corriger le fichier .eslintrc.json
function verifyEslintrc() {
  console.log('\nVérification de .eslintrc.json...');
  
  const eslintrcPath = path.join(ROOT_DIR, '.eslintrc.json');
  
  if (fs.existsSync(eslintrcPath)) {
    try {
      const content = fs.readFileSync(eslintrcPath, 'utf8');
      const config = JSON.parse(content);
      
      let updated = false;
      
      // S'assurer que certaines règles sont définies correctement
      if (!config.rules) {
        config.rules = {};
        updated = true;
      }
      
      if (!config.rules['padding-line-between-statements']) {
        config.rules['padding-line-between-statements'] = [
          { blankLine: 'always', prev: '*', next: 'return' },
          { blankLine: 'never', prev: 'directive', next: 'directive' }
        ];
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(eslintrcPath, JSON.stringify(config, null, 2));
        console.log('.eslintrc.json mis à jour.');
      } else {
        console.log('.eslintrc.json est déjà correctement configuré.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de .eslintrc.json:', error);
    }
  } else {
    console.log('.eslintrc.json non trouvé, aucune action nécessaire.');
  }
}

// Vérifier et corriger le fichier .prettierignore
function verifyPrettierignore() {
  console.log('\nVérification de .prettierignore...');
  
  const prettierignorePath = path.join(ROOT_DIR, '.prettierignore');
  
  if (fs.existsSync(prettierignorePath)) {
    console.log('.prettierignore existe déjà, vérification du contenu...');
    
    let content = fs.readFileSync(prettierignorePath, 'utf8');
    const lines = content.split('\n').map(line => line.trim());
    
    // S'assurer que ces patterns sont ignorés
    const patternsToIgnore = [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '*.min.js',
      '*.min.css',
      '*.bundle.js'
    ];
    
    let updated = false;
    
    for (const pattern of patternsToIgnore) {
      if (!lines.includes(pattern)) {
        lines.push(pattern);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(prettierignorePath, lines.join('\n'));
      console.log('.prettierignore mis à jour.');
    } else {
      console.log('.prettierignore est déjà correctement configuré.');
    }
  } else {
    console.log('.prettierignore non trouvé, création...');
    
    const ignoreContent = `
# Build outputs
dist/
build/
coverage/

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# System Files
.DS_Store
Thumbs.db

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Minified files
*.min.js
*.min.css
*.bundle.js
`.trim();
    
    fs.writeFileSync(prettierignorePath, ignoreContent);
    console.log('.prettierignore créé avec succès.');
  }
}

// Exécuter les vérifications
function main() {
  console.log('=== VÉRIFICATION DES FICHIERS DE MÉTADONNÉES ===');
  
  verifyPrettierrc();
  verifyEslintrc();
  verifyPrettierignore();
  
  console.log('\n=== VÉRIFICATION TERMINÉE ===');
}

main();
