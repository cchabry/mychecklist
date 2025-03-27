import { fileURLToPath } from 'url';
#!/usr/bin/env node

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
* Script de partage des rapports d'architecture
* 
* Ce script facilite le partage des rapports d'architecture
* via différents canaux (e-mail, Slack, etc.).
*/
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { exportReport, ExportOptions, ExportFormat } from './export-architecture-report';
// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '../..');
const CONFIG_FILE = path.join(ROOT_DIR, '.architecture-share.json');
// Types pour la configuration
interface ShareConfig {
recipients: string[];
subject: string;
message: string;
exportFormat: ExportFormat;
channels: ('email' | 'slack' | 'teams')[];
}
/**
* Charge la configuration de partage
*/
function loadShareConfig(): ShareConfig {
// Configuration par défaut
const defaultConfig: ShareConfig = {
recipients: [],
subject: 'Rapport d\'analyse architecturale',
message: 'Veuillez trouver ci-joint le dernier rapport d\'analyse architecturale.',
exportFormat: 'html',
channels: ['email']
};
// Vérifier si le fichier de configuration existe
if (fs.existsSync(CONFIG_FILE)) {
try {
const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
const config = JSON.parse(configContent);
return { ...defaultConfig, ...config };
} catch (error) {
console.error(chalk.yellow('Erreur lors de la lecture du fichier de configuration. Utilisation de la configuration par défaut.'));
return defaultConfig;
}
}
return defaultConfig;
}
/**
* Enregistre la configuration de partage
*/
function saveShareConfig(config: ShareConfig): void {
try {
fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
console.log(chalk.green('Configuration de partage enregistrée avec succès.'));
} catch (error) {
console.error(chalk.red('Erreur lors de l\'enregistrement de la configuration de partage:'));
console.error(error);
}
}
/**
* Configure le partage par e-mail
*/
function configureEmailSharing(args: string[]): void {
const config = loadShareConfig();
// Traitement des arguments pour configurer l'e-mail
const recipientsArg = args.find(arg => arg.startsWith('--recipients='));
if (recipientsArg) {
config.recipients = recipientsArg.split('=')[1].split(',');
}
const subjectArg = args.find(arg => arg.startsWith('--subject='));
if (subjectArg) {
config.subject = subjectArg.split('=')[1];
}
const messageArg = args.find(arg => arg.startsWith('--message='));
if (messageArg) {
config.message = messageArg.split('=')[1];
}
// S'assurer que le canal email est activé
if (!config.channels.includes('email')) {
config.channels.push('email');
}
saveShareConfig(config);
}
/**
* Partage le rapport par e-mail
*/
function shareByEmail(reportPath: string, config: ShareConfig): void {
if (config.recipients.length === 0) {
console.error(chalk.yellow('Aucun destinataire configuré pour l\'e-mail. Utilisez --configure-email pour ajouter des destinataires.'));
return;
}
try {
const recipients = config.recipients.join(',');
const subject = encodeURIComponent(config.subject);
const body = encodeURIComponent(config.message);
// Ouvrir le client de messagerie par défaut avec les informations pré-remplies
const mailtoUrl = `mailto:${recipients}?subject=${subject}&body=${body}`;
// Cette approche ouvre le client de messagerie mais ne peut pas joindre
// automatiquement le fichier (limitations de sécurité des navigateurs)
console.log(chalk.blue('Ouverture du client de messagerie...'));
const platform = process.platform;
if (platform === 'win32') {
execSync(`start "${mailtoUrl}"`);
} else if (platform === 'darwin') {
execSync(`open "${mailtoUrl}"`);
} else {
execSync(`xdg-open "${mailtoUrl}"`);
}
console.log(chalk.green('✓ Client de messagerie ouvert.'));
console.log(chalk.yellow(`Pour joindre le rapport, naviguez manuellement vers: ${reportPath}`));
} catch (error) {
console.error(chalk.red('Erreur lors de l\'ouverture du client de messagerie:'));
console.error(error);
}
}
/**
* Configure le partage Slack
*/
function configureSlackSharing(): void {
const config = loadShareConfig();
// Traitement des arguments pour configurer Slack
// Implémentation à compléter selon les besoins spécifiques
// S'assurer que le canal Slack est activé
if (!config.channels.includes('slack')) {
config.channels.push('slack');
}
saveShareConfig(config);
console.log(chalk.yellow('Configuration Slack à implémenter selon les besoins spécifiques.'));
}
/**
* Partage le rapport via Slack
*/
function shareBySlack(reportPath: string): void {
console.log(chalk.yellow('Partage Slack à implémenter selon les besoins spécifiques.'));
console.log(chalk.yellow(`Rapport à partager: ${reportPath}`));
}
/**
* Configure le partage Teams
*/
function configureTeamsSharing(): void {
const config = loadShareConfig();
// Traitement des arguments pour configurer Teams
// Implémentation à compléter selon les besoins spécifiques
// S'assurer que le canal Teams est activé
if (!config.channels.includes('teams')) {
config.channels.push('teams');
}
saveShareConfig(config);
console.log(chalk.yellow('Configuration Teams à implémenter selon les besoins spécifiques.'));
}
/**
* Partage le rapport via Teams
*/
function shareByTeams(reportPath: string): void {
console.log(chalk.yellow('Partage Teams à implémenter selon les besoins spécifiques.'));
console.log(chalk.yellow(`Rapport à partager: ${reportPath}`));
}
/**
* Partage le rapport via les canaux configurés
*/
function shareReport(reportPath: string, config: ShareConfig): void {
if (config.channels.includes('email')) {
shareByEmail(reportPath, config);
}
if (config.channels.includes('slack')) {
shareBySlack(reportPath);
}
if (config.channels.includes('teams')) {
shareByTeams(reportPath);
}
}
/**
* Affiche l'aide
*/
function showHelp(): void {
console.log(chalk.bold('Utilisation du script de partage des rapports d\'architecture'));
console.log(chalk.gray('=========================================================='));
console.log('');
console.log('Options:');
console.log('  --help                      Affiche cette aide');
console.log('  --format=<format>           Format du rapport (html, json, pdf, markdown)');
console.log('  --timestamp                 Inclut un horodatage dans le nom du fichier');
console.log('  --project=<nom>             Spécifie le nom du projet');
console.log('  --configure-email           Configure le partage par e-mail');
console.log('  --recipients=<emails>       Liste d\'e-mails séparés par des virgules');
console.log('  --subject=<sujet>           Sujet de l\'e-mail');
console.log('  --message=<message>         Corps de l\'e-mail');
console.log('  --configure-slack           Configure le partage Slack');
console.log('  --configure-teams           Configure le partage Teams');
console.log('');
console.log('Exemples:');
console.log('  npm run architecture:share');
console.log('  npm run architecture:share -- --format=pdf --project="Mon Projet"');
console.log('  npm run architecture:share -- --configure-email --recipients=equipe@example.com');
}
/**
* Point d'entrée principal
*/
function main() {
// Récupérer les arguments de ligne de commande
const args = process.argv.slice(2);
// Afficher l'aide si demandé
if (args.includes('--help') || args.includes('-h')) {
showHelp();
return;
}
// Configuration des canaux de partage
if (args.includes('--configure-email')) {
configureEmailSharing(args);
return;
}
if (args.includes('--configure-slack')) {
configureSlackSharing();
return;
}
if (args.includes('--configure-teams')) {
configureTeamsSharing();
return;
}
console.log(chalk.bold('Partage du rapport d\'architecture'));
console.log(chalk.gray('==============================='));
// Charger la configuration
const config = loadShareConfig();
// Exporter d'abord le rapport dans le format configuré
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as ExportFormat || config.exportFormat;
const exportOptions: ExportOptions = {
format,
includeTimestamp: args.includes('--timestamp') || args.includes('-t'),
projectName: args.find(arg => arg.startsWith('--project='))?.split('=')[1],
};
try {
console.log(chalk.blue(`Exportation du rapport au format ${format}...`));
const reportPath = exportReport(exportOptions);
console.log(chalk.green(`✓ Rapport exporté avec succès: ${reportPath}`));
// Partager le rapport
shareReport(reportPath, config);
} catch (error) {
console.error(chalk.red('Erreur lors du partage du rapport:'));
console.error(error);
process.exit(1);
}
}
if (require.main === module) {
main();
}
