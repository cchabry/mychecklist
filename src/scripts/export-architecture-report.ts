import { fileURLToPath } from 'url';
#!/usr/bin/env node

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
* Script d'export des rapports d'architecture
* 
* Ce script permet d'exporter les rapports d'architecture dans différents formats
* et facilite leur partage entre les membres de l'équipe.
*/
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { ArchitectureMetrics } from '../utils/dashboard';
// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const EXPORTS_DIR = path.join(REPORTS_DIR, 'exports');
const METRICS_FILE = path.join(REPORTS_DIR, 'architecture-metrics.json');
const DASHBOARD_FILE = path.join(REPORTS_DIR, 'architecture-dashboard.html');
// Types d'export disponibles
type ExportFormat = 'html' | 'json' | 'pdf' | 'markdown';
interface ExportOptions {
format: ExportFormat;
outputPath?: string;
includeTimestamp?: boolean;
projectName?: string;
compareWith?: string;
}
/**
* Vérifie si les rapports existent avant de procéder
*/
function checkReportsExist(): boolean {
if (!fs.existsSync(METRICS_FILE)) {
console.error(chalk.red(`Erreur: Le fichier de métriques ${METRICS_FILE} n'existe pas.`));
console.log(chalk.yellow('Exécutez d\'abord "npm run architecture:analyze" pour générer les métriques.'));
return false;
}
if (!fs.existsSync(DASHBOARD_FILE)) {
console.error(chalk.red(`Erreur: Le tableau de bord ${DASHBOARD_FILE} n'existe pas.`));
console.log(chalk.yellow('Exécutez d\'abord "npm run architecture:dashboard" pour générer le tableau de bord.'));
return false;
}
return true;
}
/**
* Crée un nom de fichier avec horodatage
*/
function createTimestampedFilename(baseName: string, format: ExportFormat): string {
const date = new Date();
const timestamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
return `${baseName}_${timestamp}.${format}`;
}
/**
* Exporte le rapport au format HTML
*/
function exportHtml(options: ExportOptions): string {
const dashboardContent = fs.readFileSync(DASHBOARD_FILE, 'utf8');
// Ajoute des styles d'impression et metadata si nécessaire
const enhancedHtml = dashboardContent
.replace('</head>', `
<style>
@media print {
.dashboard-grid { display: block; }
.card { break-inside: avoid; margin-bottom: 20px; }
body { font-size: 12px; }
}
</style>
<meta name="generator" content="Architecture Analyzer">
${options.projectName ? `<meta name="project" content="${options.projectName}">` : ''}
<meta name="export-date" content="${new Date().toISOString()}">
</head>`);
// Créer le répertoire de sortie s'il n'existe pas
const outputDir = options.outputPath || EXPORTS_DIR;
if (!fs.existsSync(outputDir)) {
fs.mkdirSync(outputDir, { recursive: true });
}
// Générer le nom de fichier
const fileName = options.includeTimestamp 
? createTimestampedFilename('architecture-report', 'html')
: 'architecture-report.html';
const outputPath = path.join(outputDir, fileName);
fs.writeFileSync(outputPath, enhancedHtml);
return outputPath;
}
/**
* Exporte le rapport au format JSON
*/
function exportJson(options: ExportOptions): string {
const metricsContent = fs.readFileSync(METRICS_FILE, 'utf8');
const metrics: ArchitectureMetrics = JSON.parse(metricsContent);
// Ajouter des métadonnées supplémentaires
const enhancedMetrics = {
...metrics,
export: {
date: new Date().toISOString(),
projectName: options.projectName || 'architecture-analyzer',
version: '1.0'
}
};
// Créer le répertoire de sortie s'il n'existe pas
const outputDir = options.outputPath || EXPORTS_DIR;
if (!fs.existsSync(outputDir)) {
fs.mkdirSync(outputDir, { recursive: true });
}
// Générer le nom de fichier
const fileName = options.includeTimestamp 
? createTimestampedFilename('architecture-metrics', 'json')
: 'architecture-metrics.json';
const outputPath = path.join(outputDir, fileName);
fs.writeFileSync(outputPath, JSON.stringify(enhancedMetrics, null, 2));
return outputPath;
}
/**
* Exporte le rapport au format PDF
*/
function exportPdf(options: ExportOptions): string {
// D'abord, exporter en HTML
const htmlPath = exportHtml(options);
try {
console.log(chalk.blue('Conversion en PDF...'));
// Essayer d'utiliser headless Chrome/Puppeteer si disponible
// Note: Cela nécessite que puppeteer soit installé
// Cette partie est commentée car elle nécessite des dépendances supplémentaires
// qui ne sont pas installées par défaut.
// Pour une implémentation complète, il faudrait installer puppeteer ou une 
// autre bibliothèque de conversion HTML->PDF.
console.log(chalk.yellow('La conversion PDF nécessite l\'installation de puppeteer.'));
console.log(chalk.yellow('Pour l\'installer: npm install puppeteer'));
console.log(chalk.yellow(`Utilisez le fichier HTML pour générer un PDF: ${htmlPath}`));
return htmlPath; // Retourne le chemin du fichier HTML en attendant
} catch (error) {
console.error(chalk.red('Erreur lors de la conversion en PDF:'));
console.error(error);
return htmlPath; // Retourne le chemin du fichier HTML en cas d'échec
}
}
/**
* Exporte le rapport au format Markdown
*/
function exportMarkdown(options: ExportOptions): string {
const metricsContent = fs.readFileSync(METRICS_FILE, 'utf8');
const metrics: ArchitectureMetrics = JSON.parse(metricsContent);
// Générer le contenu Markdown
let markdownContent = `# Rapport d'analyse architecturale\n\n`;
markdownContent += `*Généré le ${new Date().toLocaleString()}*\n\n`;
if (options.projectName) {
markdownContent += `**Projet**: ${options.projectName}\n\n`;
}
// Résumé
markdownContent += `## Résumé\n\n`;
markdownContent += `- **Taux de conformité**: ${metrics.summary.complianceRate}%\n`;
markdownContent += `- **Features conformes**: ${metrics.summary.featuresCompliant}/${metrics.summary.featuresTotal}\n`;
markdownContent += `- **Problèmes détectés**: ${metrics.summary.issuesTotal}\n\n`;
// Problèmes par sévérité
markdownContent += `### Problèmes par sévérité\n\n`;
markdownContent += `| Sévérité | Nombre |\n|----------|--------|\n`;
Object.entries(metrics.summary.issuesBySeverity).forEach(([severity, count]) => {
markdownContent += `| ${severity} | ${count} |\n`;
});
markdownContent += `\n`;
// Anti-patterns détectés
markdownContent += `## Anti-patterns détectés\n\n`;
markdownContent += `| Règle | Sévérité | Occurrences |\n|-------|----------|------------|\n`;
metrics.antiPatterns.detectedPatterns.forEach(pattern => {
markdownContent += `| ${pattern.ruleName} | ${pattern.severity} | ${pattern.occurrences} |\n`;
});
markdownContent += `\n`;
// Features
markdownContent += `## État des features\n\n`;
markdownContent += `| Feature | Conforme | Problèmes |\n|---------|----------|----------|\n`;
metrics.domainDetails.features.forEach(feature => {
const issues = [...feature.missingFiles, ...feature.missingExports];
markdownContent += `| ${feature.name} | ${feature.compliant ? '✅' : '❌'} | ${issues.length > 0 ? issues.join(', ') : '-'} |\n`;
});
markdownContent += `\n`;
// Liste détaillée des problèmes
markdownContent += `## Problèmes détaillés\n\n`;
markdownContent += `| Domaine | Catégorie | Sévérité | Description |\n|---------|-----------|----------|-------------|\n`;
metrics.issues.forEach(issue => {
markdownContent += `| ${issue.domain} | ${issue.category} | ${issue.severity} | ${issue.description} |\n`;
});
// Créer le répertoire de sortie s'il n'existe pas
const outputDir = options.outputPath || EXPORTS_DIR;
if (!fs.existsSync(outputDir)) {
fs.mkdirSync(outputDir, { recursive: true });
}
// Générer le nom de fichier
const fileName = options.includeTimestamp 
? createTimestampedFilename('architecture-report', 'markdown')
: 'architecture-report.md';
const outputPath = path.join(outputDir, fileName);
fs.writeFileSync(outputPath, markdownContent);
return outputPath;
}
/**
* Exporte les rapports dans le format spécifié
*/
function exportReport(options: ExportOptions): string {
switch (options.format) {
case 'html':
return exportHtml(options);
case 'json':
return exportJson(options);
case 'pdf':
return exportPdf(options);
case 'markdown':
return exportMarkdown(options);
default:
throw new Error(`Format d'export non pris en charge: ${options.format}`);
}
}
/**
* Ouvre le rapport exporté
*/
function openReport(filePath: string): void {
try {
const platform = process.platform;
if (platform === 'win32') {
execSync(`start ${filePath}`);
} else if (platform === 'darwin') {
execSync(`open ${filePath}`);
} else {
execSync(`xdg-open ${filePath}`);
}
console.log(chalk.green(`✓ Rapport ouvert: ${filePath}`));
} catch (error) {
console.error(chalk.yellow(`Impossible d'ouvrir automatiquement le rapport. Chemin du fichier: ${filePath}`));
}
}
/**
* Point d'entrée principal
*/
function main() {
// Récupérer les arguments de ligne de commande
const args = process.argv.slice(2);
const format = (args[0] || 'html') as ExportFormat;
const options: ExportOptions = {
format,
includeTimestamp: args.includes('--timestamp') || args.includes('-t'),
projectName: args.find(arg => arg.startsWith('--project='))?.split('=')[1],
outputPath: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
compareWith: args.find(arg => arg.startsWith('--compare='))?.split('=')[1]
};
console.log(chalk.bold('Export du rapport d\'architecture'));
console.log(chalk.gray('=============================='));
if (!checkReportsExist()) {
process.exit(1);
}
try {
console.log(chalk.blue(`Exportation au format ${format}...`));
const outputPath = exportReport(options);
console.log(chalk.green(`✓ Rapport exporté avec succès: ${outputPath}`));
// Si l'option --open ou -o est spécifiée, ouvrir le rapport
if (args.includes('--open') || args.includes('-o')) {
openReport(outputPath);
}
} catch (error) {
console.error(chalk.red('Erreur lors de l\'exportation du rapport:'));
console.error(error);
process.exit(1);
}
}
if (require.main === module) {
main();
}
export { exportReport };
export type { ExportOptions, ExportFormat };
