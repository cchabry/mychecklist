#!/usr/bin/env node
/**
 * Script de vérification spécifique pour la phase 2
 * Script utilitaire pour faciliter l'exécution de la vérification de phase 2
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

// Créer le répertoire des rapports s'il n'existe pas
if (!fs.existsSync(REPORTS_DIR)) {
  console.log('Création du répertoire des rapports...');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

try {
  console.log('Exécution de la vérification de la phase 2...');
  // Utiliser node au lieu de ts-node
  execSync('node src/scripts/verify-architecture-phase.js --phase=2', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../..')
  });
  console.log('Vérification terminée avec succès!');
  
  // Afficher le chemin vers les rapports générés
  console.log(`\nRapports disponibles dans: ${REPORTS_DIR}`);
  
  // Lister les fichiers de rapport générés
  if (fs.existsSync(REPORTS_DIR)) {
    const reports = fs.readdirSync(REPORTS_DIR).filter(file => file.startsWith('phase2-') || file === 'phase-progress.html');
    if (reports.length > 0) {
      console.log('Rapports générés:');
      reports.forEach(report => {
        console.log(`- ${report}`);
      });
    }
  }
} catch (error) {
  console.error('Erreur lors de la vérification de la phase 2:');
  console.error(error);
  process.exit(1);
}
