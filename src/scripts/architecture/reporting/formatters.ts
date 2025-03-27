
/**
 * Formatage des rapports d'analyse d'architecture
 */
import { PhaseVerificationResult } from '../types';

/**
 * Formate un timestamp pour le nom de fichier
 */
export function formatTimestampForFilename(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Génère le contenu du rapport markdown
 */
export function generateMarkdownReport(
  phaseName: string, 
  result: PhaseVerificationResult
): string {
  return `# Rapport de vérification - ${phaseName}
  
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## Résumé

**Statut**: ${result.completed ? '✅ TERMINÉE' : '🔄 EN COURS'}
**Score**: ${result.score}/${result.maxScore} (${result.percentage}%)

## Indicateurs de succès

${result.results.map(r => `- ${r.passed ? '✅' : '❌'} **${r.name}** (${r.weight} points)\n`).join('')}

## Recommandations

${result.percentage < 100 ? `Pour atteindre 100%, il faut travailler sur les indicateurs suivants:
${result.results.filter(r => !r.passed).map(r => `- ${r.name}\n`).join('')}` : 'Tous les indicateurs sont validés. La phase est terminée avec succès!'}

---
Rapport généré automatiquement par le script de vérification d'architecture.
`;
}
