
#!/usr/bin/env node

/**
* Script de serveur pour le tableau de bord d'architecture
* 
* Ce script démarre un serveur local pour afficher le tableau
* de bord des métriques d'architecture du projet.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DASHBOARD_PATH = path.join(__dirname, '../../reports/architecture-dashboard.html');

const server = createServer((req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const filePath = reqUrl.pathname === '/' ? DASHBOARD_PATH : path.join(__dirname, '../../reports', reqUrl.pathname);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      console.error(`Fichier non trouvé: ${filePath}`);
      return;
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    if (extname === '.js') {
      contentType = 'text/javascript';
    } else if (extname === '.css') {
      contentType = 'text/css';
    } else if (extname === '.json') {
      contentType = 'application/json';
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Tableau de bord disponible sur http://localhost:${PORT}`);
});
