
/**
* Script de vérification des phases d'architecture
* 
* Ce script vérifie si une phase du plan d'alignement architectural
* est complètement terminée selon les indicateurs de succès définis.
*/

// Importer le nouveau module refactorisé
import { main, verifyPhase } from './architecture/index';

// Exécuter le script principal lorsqu'il est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Réexporter pour maintenir la compatibilité avec les imports existants
export { verifyPhase, phases } from './architecture/index';
