
/**
 * Module principal de vérification des phases d'architecture
 * 
 * Ce module fournit des outils pour vérifier le respect des principes 
 * architecturaux définis pour le projet.
 */
import fs from 'fs';
import { phases } from './phases';
import { PhaseVerificationResult, IndicatorResult } from './types';
import { generateReport } from './reporting';
import { getReportsDirectory } from './utils';

/**
 * Vérifie une phase spécifique et génère un rapport
 */
export async function verifyPhase(phaseIndex: number): Promise<PhaseVerificationResult> {
  const phase = phases[phaseIndex];
  if (!phase) {
    throw new Error(`Phase ${phaseIndex} non trouvée`);
  }
  
  console.log(`\nVérification de la ${phase.name}`);
  console.log(phase.description);
  console.log('--------------------------------------------------');
  
  const results: IndicatorResult[] = [];
  let score = 0;
  let maxScore = 0;
  
  for (const indicator of phase.indicators) {
    process.stdout.write(`- ${indicator.name}... `);
    
    try {
      const passed = await indicator.check();
      const indicatorScore = passed ? indicator.weight : 0;
      
      score += indicatorScore;
      maxScore += indicator.weight;
      
      results.push({
        name: indicator.name,
        passed,
        weight: indicator.weight
      });
      
      process.stdout.write(passed ? 'SUCCÈS' : 'ÉCHEC');
      process.stdout.write(`\n  ${indicator.description}\n`);
    } catch (error) {
      process.stdout.write('ERREUR\n');
      console.error(`  Erreur lors de la vérification: ${error}`);
      
      results.push({
        name: indicator.name,
        passed: false,
        weight: indicator.weight
      });
      
      maxScore += indicator.weight;
    }
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  const completed = percentage >= 80; // Une phase est considérée terminée à 80%
  
  return {
    completed,
    score,
    maxScore,
    percentage,
    results
  };
}

// Point d'entrée principal
export async function main() {
  console.log("Script de vérification des phases d'architecture");
  
  // Créer le dossier reports s'il n'existe pas
  const reportsDir = getReportsDirectory();
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Vérifier la phase 3 (Service Notion API) par défaut
  const phaseToVerify = process.argv[2] ? parseInt(process.argv[2]) - 1 : 2;
  
  try {
    const result = await verifyPhase(phaseToVerify);
    
    console.log('\n--------------------------------------------------');
    console.log(`Résultat: ${result.score}/${result.maxScore} (${result.percentage}%)`);
    console.log(`Statut: ${result.completed ? 'PHASE TERMINÉE' : 'PHASE EN COURS'}`);
    
    // Générer un rapport détaillé
    const reportPath = generateReport(phaseToVerify, phases[phaseToVerify].name, result);
    console.log(`\nRapport enregistré dans ${reportPath}`);
    
  } catch (error) {
    console.error(`Erreur: ${error}`);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Exports pour les tests
export { verifyPhase, phases };
