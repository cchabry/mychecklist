
# Référence des règles d'architecture

Ce document détaille les règles d'architecture appliquées dans le projet, leur justification et comment les respecter.

## Principes fondamentaux

Notre architecture repose sur des principes clés qui guident toutes nos décisions :

1. **Simplicité avant tout** - Nous privilégions les solutions simples et directes.
2. **Séparation des responsabilités** - Chaque composant a une responsabilité claire et unique.
3. **Typage fort** - TypeScript est utilisé avec rigueur pour garantir la sécurité des types.
4. **Mode réel vs mode démonstration** - Séparation claire entre les modes sans basculement automatique complexe.
5. **Gestion explicite des erreurs** - Traitement cohérent à tous les niveaux.

## Règles d'architecture et leur justification

### Structure des fichiers

| Règle | Description | Justification | Comment la respecter |
|-------|-------------|---------------|----------------------|
| `feature-structure` | Les features doivent suivre la structure définie | Assure une organisation cohérente et prévisible | Créer les dossiers `/components`, `/hooks`, et les fichiers `types.ts`, `index.ts` pour chaque feature |
| `single-responsibility` | Les fichiers doivent avoir une seule responsabilité | Facilite la maintenance et la compréhension | Limiter la taille des fichiers (`MAX_FILE_LINES` lignes) et extraire les responsabilités distinctes |
| `consistent-exports` | Les exports doivent être cohérents | Facilite l'utilisation des modules | Utiliser les fichiers `index.ts` pour exposer une API claire |

### Nommage

| Règle | Description | Justification | Comment la respecter |
|-------|-------------|---------------|----------------------|
| `hooks-naming` | Les hooks doivent commencer par "use" | Convention React officielle | Nommer tous les hooks avec le préfixe "use" (ex: `useProject.ts`) |
| `component-naming` | Les composants doivent commencer par une majuscule | Convention React officielle | Nommer tous les composants en PascalCase (ex: `ProjectCard.tsx`) |
| `checklist-naming-convention` | Nommer les items de checklist selon la convention établie | Cohérence dans les données | Suivre le format "Catégorie - Action" pour les titres |

### Types

| Règle | Description | Justification | Comment la respecter |
|-------|-------------|---------------|----------------------|
| `no-any-types` | Éviter l'utilisation du type `any` | Maintient l'intégrité du typage | Utiliser des types spécifiques ou `unknown` avec une vérification de type |
| `typed-props` | Les props des composants doivent être typées | Clarté et sécurité | Définir des interfaces pour toutes les props |
| `evaluation-score-validation` | Les scores d'évaluation doivent utiliser des enums | Évite les valeurs invalides | Utiliser l'enum `ScoreType` pour les scores |

### Modularité

| Règle | Description | Justification | Comment la respecter |
|-------|-------------|---------------|----------------------|
| `no-circular-dependencies` | Pas de dépendances circulaires | Évite les bugs difficiles à déboguer | Organiser hiérarchiquement les imports |
| `service-interface` | Les services doivent avoir une interface claire | Facilite l'utilisation et les tests | Définir des interfaces explicites pour tous les services |
| `no-direct-notion-api` | Pas d'appel direct à l'API Notion | Encapsule la complexité de l'API | Utiliser les services dédiés pour accéder à l'API Notion |

### Domaines spécifiques

| Règle | Description | Justification | Comment la respecter |
|-------|-------------|---------------|----------------------|
| `audit-validation` | Valider les données d'audit | Intégrité des données | Utiliser des fonctions de validation dédiées |
| `project-data-integrity` | Maintenir l'intégrité des données de projet | Cohérence des relations | Vérifier les références entre entités |
| `notion-connection-error-handling` | Gérer les erreurs de connexion Notion | Expérience utilisateur | Implémenter des stratégies de récupération explicites |

## Seuils de conformité

### Seuils globaux

| Seuil | Valeur par défaut | Description | Justification |
|-------|------------------|-------------|---------------|
| `overall-compliance` | 80% | Taux minimal de conformité globale | Assure un niveau de qualité acceptable |
| `critical-issues` | 0 | Nombre maximal de problèmes critiques | Les problèmes critiques doivent être résolus immédiatement |
| `high-issues` | 5 | Nombre maximal de problèmes importants | Limite raisonnable pour les problèmes importants |
| `file-size` | 300 lignes | Taille maximale des fichiers | Facilite la compréhension et la maintenance |
| `component-complexity` | 15 | Complexité maximale des composants | Évite les composants trop complexes |

### Seuils par domaine

| Domaine | Seuil | Valeur par défaut | Description |
|---------|-------|------------------|-------------|
| Audit | `audit-completion-rate` | 90% | Taux minimal de complétion des audits |
| Projet | `project-documentation` | 80% | Score minimal de documentation des projets |
| Action | `action-correction-rate` | 75% | Pourcentage minimal d'actions correctives complétées |
| Checklist | `checklist-coverage` | 85% | Pourcentage minimal d'items couverts par les exigences |
| Évaluation | `evaluation-consistency` | 90% | Score minimal de cohérence entre les évaluations |
| Notion | `notion-api-call-limit` | 10 | Nombre maximal d'appels directs à l'API Notion |

## Processus de validation

Pour vous assurer que votre code respecte ces règles :

1. Exécutez `npm run architecture:quick` avant de commiter pour analyser les fichiers modifiés
2. Consultez le tableau de bord (`npm run architecture:serve`) pour une vue d'ensemble
3. Utilisez l'extension VS Code pour visualiser les problèmes dans l'éditeur
4. Référez-vous à ce document pour comprendre les règles et comment les respecter

## Exemples de bonnes pratiques

### Structure de feature correcte

```typescript
// /features/projects/index.ts
export * from './components';
export * from './hooks';
export * from './types';
export { createProject, updateProject } from './utils';

// /features/projects/types.ts
export interface Project {
  id: string;
  name: string;
  // ...
}

// /features/projects/components/index.ts
export { ProjectCard } from './ProjectCard';
export { ProjectForm } from './ProjectForm';

// /features/projects/hooks/index.ts
export { useProjects } from './useProjects';
export { useProjectById } from './useProjectById';
```

### Gestion correcte des erreurs

```typescript
export async function getProject(id: string): Promise<Project | null> {
  try {
    return await projectApi.getProject(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet ${id}:`, error);
    throw new AppError({
      type: ErrorType.DATA_FETCH_ERROR,
      message: `Impossible de récupérer le projet: ${getErrorMessage(error)}`,
      originalError: error
    });
  }
}
```

### Component avec props correctement typées

```typescript
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ProjectCard({ project, onEdit, onDelete, className }: ProjectCardProps) {
  // Implémentation...
}
```

## Évolution des règles

Les règles d'architecture peuvent évoluer avec le projet. Pour proposer des modifications :

1. Créez une issue dans le système de suivi
2. Décrivez la règle à modifier et sa justification
3. Proposez une implémentation de la vérification
4. Soumettez pour revue

