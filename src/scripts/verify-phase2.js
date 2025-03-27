
#!/usr/bin/env node
/**
 * Script de vérification spécifique pour la phase 2
 * Script utilitaire pour faciliter l'exécution de la vérification de phase 2
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Exécution de la vérification de la phase 2...');
  execSync('npx ts-node src/scripts/verify-architecture-phase.ts --phase=2', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../..')
  });
  console.log('Vérification terminée avec succès!');
} catch (error) {
  console.error('Erreur lors de la vérification de la phase 2:');
  process.exit(1);
}
