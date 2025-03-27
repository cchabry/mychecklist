
/**
* Script de vérification des phases d'architecture
* 
* Ce script vérifie si une phase du plan d'alignement architectural
* est complètement terminée selon les indicateurs de succès définis.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Indicateurs de succès pour chaque phase
interface PhaseIndicators {
  name: string;
  description: string;
  indicators: Array<{
    name: string;
    description: string;
    check: () => Promise<boolean>;
    weight: number; // Importance relative de l'indicateur (1-10)
  }>;
}

// Phases du plan d'alignement architectural
const phases: PhaseIndicators[] = [
  // Phase 1: Fondations (déjà terminée)
  {
    name: 'Phase 1: Fondations',
    description: 'Mise en place de l\'infrastructure de base',
    indicators: [
      // ... indicateurs de la phase 1
    ]
  },
  // Phase 2: Infrastructure (déjà terminée)
  {
    name: 'Phase 2: Infrastructure',
    description: 'Mise en place des services centraux',
    indicators: [
      // ... indicateurs de la phase 2
    ]
  },
  // Phase 3: Service Notion API (phase actuelle)
  {
    name: 'Phase 3: Service Notion API',
    description: 'Refactoring du client API et gestion d\'erreurs cohérente',
    indicators: [
      {
        name: 'Séparation Client / API',
        description: 'Le client HTTP et le service API sont clairement séparés',
        check: async () => {
          // Vérifier que notionHttpClient.ts et notionApiImpl.ts existent et ont des responsabilités distinctes
          const clientExists = fs.existsSync(path.join(__dirname, '../services/notion/client/notionHttpClient.ts'));
          const apiImplExists = fs.existsSync(path.join(__dirname, '../services/notion/notionApiImpl.ts'));
          return clientExists && apiImplExists;
        },
        weight: 8
      },
      {
        name: 'Client unifié',
        description: 'Un point d\'entrée unique pour l\'API (réel ou démo)',
        check: async () => {
          // Vérifier que notionClient.ts contient la logique de sélection réel/démo
          const clientPath = path.join(__dirname, '../services/notion/client/notionClient.ts');
          if (!fs.existsSync(clientPath)) return false;
          
          const content = fs.readFileSync(clientPath, 'utf8');
          return content.includes('isMockMode') && 
                 content.includes('notionHttpClient') && 
                 content.includes('notionMockClient');
        },
        weight: 7
      },
      {
        name: 'Gestion d\'erreurs standard',
        description: 'Une stratégie commune pour traiter et présenter les erreurs',
        check: async () => {
          // Vérifier l'existence et l'utilisation de errorUtils.ts
          const errorUtilsPath = path.join(__dirname, '../utils/error/errorUtils.ts');
          if (!fs.existsSync(errorUtilsPath)) return false;
          
          // Vérifier que le hook useErrorHandler est utilisé dans les services
          const errorHookPath = path.join(__dirname, '../hooks/error/useErrorHandler.ts');
          if (!fs.existsSync(errorHookPath)) return false;
          
          // Vérifier l'utilisation dans au moins un service
          const serviceFilesPromise = glob(path.join(__dirname, '../services/**/*.ts'));
          let usageCount = 0;
          
          const serviceFiles = await serviceFilesPromise;
          for (const file of serviceFiles) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('handleError') || content.includes('useErrorHandler')) {
              usageCount++;
            }
          }
          
          return usageCount >= 2; // Au moins deux services utilisent la gestion d'erreurs
        },
        weight: 9
      },
      {
        name: 'Réduction des couches d\'abstraction',
        description: 'Élimination des couches redondantes dans l\'API',
        check: async () => {
          // Compter le nombre de fichiers dans le dossier services/notion
          const notionDir = path.join(__dirname, '../services/notion');
          const filePromise = glob(path.join(notionDir, '**/*.ts'));
          const files = await filePromise;
          const fileCount = files.length;
          
          // Une bonne architecture ne devrait pas avoir trop de fichiers pour le même domaine
          return fileCount <= 15; // Seuil à ajuster selon l'objectif précis
        },
        weight: 6
      },
      {
        name: 'Coordination avec le mode opérationnel',
        description: 'Les services Notion utilisent correctement useOperationMode',
        check: async () => {
          // Vérifier que les services Notion utilisent useOperationMode
          const notionFilePath = path.join(__dirname, '../services/notion/client/notionClient.ts');
          if (!fs.existsSync(notionFilePath)) return false;
          
          const content = fs.readFileSync(notionFilePath, 'utf8');
          return content.includes('useOperationMode') || 
                 content.includes('isDemoMode');
        },
        weight: 7
      }
    ]
  },
  // Autres phases (à implémenter ultérieurement)
  // ...
];

/**
 * Vérifie une phase spécifique et génère un rapport
 */
async function verifyPhase(phaseIndex: number): Promise<{ 
  completed: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  results: Array<{ 
    name: string;
    passed: boolean;
    weight: number;
  }>;
}> {
  const phase = phases[phaseIndex];
  if (!phase) {
    throw new Error(`Phase ${phaseIndex} non trouvée`);
  }
  
  console.log(`\nVérification de la ${phase.name}`);
  console.log(phase.description);
  console.log('--------------------------------------------------');
  
  const results = [];
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

/**
 * Génère un rapport dans un fichier markdown
 */
function generateReport(phaseIndex: number, result: ReturnType<typeof verifyPhase> extends Promise<infer T> ? T : never): void {
  const phase = phases[phaseIndex];
  const reportsDir = path.join(__dirname, '../../reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `phase-${phaseIndex + 1}-report-${timestamp}.md`);
  
  const reportContent = `# Rapport de vérification - ${phase.name}
  
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
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nRapport enregistré dans ${reportPath}`);
}

// Point d'entrée principal
async function main() {
  console.log("Script de vérification des phases d'architecture");
  
  // Créer le dossier reports s'il n'existe pas
  const reportsDir = path.join(__dirname, '../../reports');
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
    generateReport(phaseToVerify, result);
    
  } catch (error) {
    console.error(`Erreur: ${error}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Exports pour les tests
export { verifyPhase, phases };
