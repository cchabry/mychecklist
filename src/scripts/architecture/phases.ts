
/**
 * Définitions des phases d'architecture et de leurs indicateurs
 */
import { PhaseDefinition } from './types';
import { 
  checkClientApiSeparation,
  checkUnifiedClient,
  checkStandardErrorHandling,
  checkAbstractionLayers,
  checkOperationModeCoordination
} from './indicators';

/**
 * Liste des phases du plan d'alignement architectural
 */
export const phases: PhaseDefinition[] = [
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
        check: checkClientApiSeparation,
        weight: 8
      },
      {
        name: 'Client unifié',
        description: 'Un point d\'entrée unique pour l\'API (réel ou démo)',
        check: checkUnifiedClient,
        weight: 7
      },
      {
        name: 'Gestion d\'erreurs standard',
        description: 'Une stratégie commune pour traiter et présenter les erreurs',
        check: checkStandardErrorHandling,
        weight: 9
      },
      {
        name: 'Réduction des couches d\'abstraction',
        description: 'Élimination des couches redondantes dans l\'API',
        check: checkAbstractionLayers,
        weight: 6
      },
      {
        name: 'Coordination avec le mode opérationnel',
        description: 'Les services Notion utilisent correctement useOperationMode',
        check: checkOperationModeCoordination,
        weight: 7
      }
    ]
  }
  // Autres phases (à implémenter ultérieurement)
  // ...
];
