
/**
 * Utilitaire pour exécuter les tests de type
 * 
 * Cet utilitaire permet de lancer la vérification des types et d'afficher un rapport
 * détaillé des problèmes rencontrés. Il peut être utile pour les développeurs qui
 * veulent vérifier que leurs modifications n'ont pas cassé le système de types.
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Vérifier que tsconfig.test.json existe
const testConfigPath = path.resolve(__dirname, '../types/__tests__/tsconfig.test.json');
if (!existsSync(testConfigPath)) {
  console.error('❌ Erreur: Impossible de trouver le fichier de configuration des tests de type');
  console.error(`   Le fichier ${testConfigPath} n'existe pas.`);
  process.exit(1);
}

console.log('🔍 Exécution des tests de type...');

// Exécuter TypeScript avec la configuration des tests
const result = spawnSync('npx', [
  'tsc',
  '--project', testConfigPath,
  '--noEmit',
  '--pretty'
], { 
  stdio: 'pipe',
  encoding: 'utf-8'
});

// Analyser le résultat
if (result.status === 0) {
  console.log('✅ Tous les tests de type ont réussi!');
  process.exit(0);
} else {
  console.error('❌ Des erreurs de type ont été détectées:');
  console.error(result.stderr || result.stdout);
  process.exit(1);
}
