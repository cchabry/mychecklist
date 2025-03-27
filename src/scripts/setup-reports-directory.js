
/**
* Script pour créer le répertoire des rapports
* 
* Ce script crée simplement le répertoire des rapports à la racine du projet
* pour s'assurer qu'il existe avant d'exécuter les analyses d'architecture.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir l'équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

console.log('Vérification du répertoire des rapports...');
console.log(`Chemin du répertoire: ${REPORTS_DIR}`);

// Créer le répertoire des rapports s'il n'existe pas
if (!fs.existsSync(REPORTS_DIR)) {
  console.log('Création du répertoire des rapports...');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  console.log(`Répertoire créé avec succès: ${REPORTS_DIR}`);
} else {
  console.log('Le répertoire des rapports existe déjà.');
}

// Créer un fichier README.md dans le répertoire des rapports
const readmePath = path.join(REPORTS_DIR, 'README.md');
if (!fs.existsSync(readmePath)) {
  const readmeContent = `# Rapports d'analyse d'architecture

Ce répertoire contient les rapports générés par les scripts d'analyse d'architecture.

## Types de rapports

- **phase1-*.html, phase2-*.html, phase3-*.html** : Rapports de vérification des phases d'architecture
- **phase-progress.html** : Rapport d'avancement des phases d'architecture
- **architecture-metrics.json** : Métriques d'architecture brutes
- **architecture-dashboard.html** : Tableau de bord d'architecture interactif
- **analysis-status.json** : Statut de la dernière analyse d'architecture

## Commandes utiles

- \`npm run verify:phase1\` : Vérifier la phase 1
- \`npm run verify:phase2\` : Vérifier la phase 2
- \`npm run verify:phase3\` : Vérifier la phase 3
- \`npm run architecture:analysis\` : Exécuter l'analyse complète
- \`npm run architecture:dashboard\` : Générer le tableau de bord
- \`npm run architecture:serve\` : Servir le tableau de bord localement

`;
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`Fichier README.md créé dans le répertoire des rapports: ${readmePath}`);
}

console.log('Configuration du répertoire des rapports terminée.');
