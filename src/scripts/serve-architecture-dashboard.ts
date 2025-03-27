
#!/usr/bin/env node
/**
 * Script de serveur pour le tableau de bord d'architecture
 * 
 * Ce script lance un serveur HTTP local qui affiche le tableau de bord
 * d'architecture et rafraîchit automatiquement les données.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Paramètres du serveur
const PORT = 3456;
const HOST = 'localhost';
const REPORTS_DIR = path.resolve(__dirname, '../../reports');
const DASHBOARD_FILE = path.join(REPORTS_DIR, 'architecture-dashboard.html');

/**
 * Vérifie et génère le tableau de bord si nécessaire
 */
function ensureDashboardExists() {
  // Vérifier si le répertoire des rapports existe
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Vérifier si le fichier du tableau de bord existe
  if (!fs.existsSync(DASHBOARD_FILE)) {
    console.log(chalk.yellow('Tableau de bord non trouvé, génération en cours...'));
    try {
      // Générer les métriques
      execSync('npx ts-node src/scripts/architecture-metrics.ts', { stdio: 'inherit' });
      
      // Générer le tableau de bord
      execSync('npx ts-node src/scripts/generate-metrics-dashboard.ts', { stdio: 'inherit' });
      
      console.log(chalk.green('Tableau de bord généré avec succès!'));
    } catch (error) {
      console.error(chalk.red('Erreur lors de la génération du tableau de bord:'));
      console.error(error);
      process.exit(1);
    }
  }
}

/**
 * Crée et démarre le serveur HTTP
 */
function startServer() {
  const server = http.createServer((req, res) => {
    // Route principale : afficher le tableau de bord
    if (req.url === '/' || req.url === '/index.html') {
      fs.readFile(DASHBOARD_FILE, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end(`Erreur lors de la lecture du tableau de bord: ${err.message}`);
          return;
        }
        
        // Ne pas ajouter de script de rafraîchissement automatique car nous avons
        // maintenant des interactions utilisateur qui seraient perdues à chaque rafraîchissement
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }
    
    // Route pour régénérer les données
    if (req.url === '/refresh') {
      try {
        execSync('npx ts-node src/scripts/architecture-metrics.ts', { stdio: 'inherit' });
        execSync('npx ts-node src/scripts/generate-metrics-dashboard.ts', { stdio: 'inherit' });
        
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } catch (error) {
        res.writeHead(500);
        res.end(`Erreur lors de la régénération: ${error}`);
      }
      return;
    }
    
    // Servir les autres fichiers statiques du répertoire de rapports
    const filePath = path.join(REPORTS_DIR, req.url || '');
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      
      // Définir le type de contenu en fonction de l'extension
      switch (ext) {
        case '.html': contentType = 'text/html'; break;
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
      }
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end(`Erreur lors de la lecture du fichier: ${err.message}`);
          return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }
    
    // Route non trouvée
    res.writeHead(404);
    res.end('Page non trouvée');
  });
  
  server.listen(PORT, HOST, () => {
    console.log(chalk.green(`\nServeur démarré à l'adresse http://${HOST}:${PORT}`));
    console.log(`Ouvrez cette URL dans votre navigateur pour voir le tableau de bord.`);
    console.log(`Utilisez http://${HOST}:${PORT}/refresh pour régénérer les données.`);
    console.log(chalk.gray('Appuyez sur Ctrl+C pour arrêter le serveur.\n'));
  });
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Démarrage du serveur de tableau de bord d\'architecture'));
  console.log(chalk.gray('================================================'));
  
  ensureDashboardExists();
  startServer();
}

main();
