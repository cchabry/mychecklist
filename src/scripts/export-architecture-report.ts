
#!/usr/bin/env node

/**
* Script d'export du rapport d'architecture
* 
* Ce script génère un rapport détaillé sur l'architecture du projet
* et l'exporte dans différents formats (HTML, PDF, JSON).
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { generateDashboard } from './generate-metrics-dashboard';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration par défaut
const DEFAULT_FORMAT = 'html';
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '..', 'reports', 'architecture-report');

/**
* Génère le rapport d'architecture au format spécifié
*/
async function generateReport(format: string, outputPath: string) {
  console.log(`Génération du rapport d'architecture au format ${format}...`);
  
  // Générer le tableau de bord HTML (si nécessaire)
  if (format !== 'json') {
    await generateDashboard();
  }
  
  try {
    switch (format) {
      case 'html':
        await generateHtmlReport(outputPath);
        break;
      case 'pdf':
        await generatePdfReport(outputPath);
        break;
      case 'json':
        await generateJsonReport(outputPath);
        break;
      default:
        console.error(`Format d'export inconnu: ${format}`);
        process.exit(1);
    }
    
    console.log(`Rapport d'architecture généré avec succès: ${outputPath}`);
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    process.exit(1);
  }
}

/**
* Génère un rapport HTML
*/
async function generateHtmlReport(outputPath: string) {
  const dashboardPath = path.join(__dirname, '..', 'reports', 'architecture-dashboard.html');
  
  if (!fs.existsSync(dashboardPath)) {
    console.error('Tableau de bord HTML non trouvé. Exécutez d\'abord la génération du tableau de bord.');
    process.exit(1);
  }
  
  // Copier le fichier HTML vers le chemin de sortie
  fs.copyFileSync(dashboardPath, `${outputPath}.html`);
}

/**
* Génère un rapport PDF
*/
async function generatePdfReport(outputPath: string) {
  const dashboardPath = path.join(__dirname, '..', 'reports', 'architecture-dashboard.html');
  
  if (!fs.existsSync(dashboardPath)) {
    console.error('Tableau de bord HTML non trouvé. Exécutez d\'abord la génération du tableau de bord.');
    process.exit(1);
  }
  
  // Lancer un navigateur headless avec Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Charger le tableau de bord HTML
  await page.goto(`file://${dashboardPath}`, {
    waitUntil: 'networkidle0' // Attendre que toutes les ressources soient chargées
  });
  
  // Générer le PDF
  await page.pdf({
    path: `${outputPath}.pdf`,
    format: 'A4',
    printBackground: true
  });
  
  await browser.close();
}

/**
* Génère un rapport JSON
*/
async function generateJsonReport(outputPath: string) {
  const metricsPath = path.join(__dirname, '..', 'reports', 'architecture-metrics.json');
  
  if (!fs.existsSync(metricsPath)) {
    console.error('Fichier de métriques JSON non trouvé. Exécutez d\'abord l\'analyse d\'architecture.');
    process.exit(1);
  }
  
  // Lire le fichier JSON et l'écrire vers le chemin de sortie
  const metrics = fs.readFileSync(metricsPath, 'utf8');
  fs.writeFileSync(`${outputPath}.json`, metrics);
}

/**
* Point d'entrée principal
*/
async function main() {
  // Récupérer les arguments de la ligne de commande
  const args = process.argv.slice(2);
  
  let format = DEFAULT_FORMAT;
  let outputPath = DEFAULT_OUTPUT_PATH;
  
  // Analyser les arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format') {
      format = args[i + 1];
      i++;
    } else if (args[i] === '--output') {
      outputPath = args[i + 1];
      i++;
    } else {
      console.warn(`Argument inconnu: ${args[i]}`);
    }
  }
  
  // Générer le rapport
  await generateReport(format, outputPath);
}

main();
