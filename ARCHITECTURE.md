
# Architecture de référence - Application d'audit d'accessibilité

## Principes fondamentaux

### Simplicité avant tout
- Préférer les solutions simples et directes
- Réduire le nombre de couches d'abstraction
- Éviter la sur-ingénierie et les patterns complexes
- Favoriser la lisibilité et la maintenabilité

### Séparation claire des responsabilités
- Découpage en composants fonctionnels bien définis
- Interfaces explicites entre les composants
- Respect du principe de responsabilité unique (SRP)
- Éviter les dépendances circulaires

### Mode réel vs mode démonstration
- Détermination du mode basée uniquement sur une configuration explicite
- Pas de basculement automatique complexe entre les modes
- Interface unifiée indépendante du mode actif
- Données de démonstration réalistes et complètes

### Typage fort avec TypeScript
- Types explicites pour toutes les structures de données
- Interfaces précises pour les composants et services
- Éviter any et unknown sauf cas exceptionnels documentés
- Utiliser les types génériques pour maximiser la réutilisation

### Gestion des erreurs explicite
- Traitement cohérent des erreurs à tous les niveaux
- Feedback utilisateur clair en cas d'erreur
- Journalisation structurée pour faciliter le diagnostic
- Stratégies de récupération explicites

## Structure technique

### Organisation des dossiers

```
/src
  /components        # Composants UI réutilisables
    /ui              # Composants de base (shadcn/ui)
    /forms           # Composants de formulaires spécifiques
    /layout          # Composants de mise en page
    /data-display    # Composants d'affichage de données
  
  /features          # Fonctionnalités principales organisées par domaine
    /projects        # Gestion des projets
    /audits          # Gestion des audits
    /checklists      # Gestion des checklists et exigences
    /sample-pages    # Gestion des pages d'échantillon
    /evaluations     # Évaluations et résultats
    /action-plan     # Plans d'action et suivi
  
  /hooks             # Hooks React personnalisés
    /api             # Hooks d'accès aux données
    /ui              # Hooks UI (responsive, etc.)
    /form            # Hooks de gestion des formulaires
  
  /services          # Services et logique métier
    /api             # Client API (Notion)
    /cache           # Service de mise en cache
    /auth            # Service d'authentification (si nécessaire)
    /analytics       # Service d'analyse (si nécessaire)
  
  /types             # Définitions de types TypeScript
    /api             # Types pour les réponses/requêtes API
    /domain          # Types du domaine métier
    /ui              # Types pour les composants UI
  
  /utils             # Utilitaires et fonctions helpers
    /format          # Formatage de données
    /validation      # Validation de données
    /date            # Manipulation de dates
  
  /contexts          # Contextes React pour l'état global
  
  /constants         # Constantes et configurations
  
  /assets            # Ressources statiques (images, etc.)
```

### Structure des features

Chaque feature est organisée selon le pattern suivant :

```
/feature-name
  /components        # Composants spécifiques à la feature
  /hooks             # Hooks spécifiques à la feature
  /types.ts          # Types spécifiques à la feature
  /utils.ts          # Utilitaires spécifiques à la feature
  /constants.ts      # Constantes spécifiques à la feature
  index.ts           # Point d'entrée exportant les éléments publics
```

## Modèle de données

### Entités principales

#### Projet
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}
```

#### Checklist
```typescript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  reference?: string[];
  profil?: string[];
  phase?: string[];
  effort: string;
  priority: string;
}
```

#### Exigence
```typescript
interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}
```

#### Page d'échantillon
```typescript
interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}
```

#### Audit
```typescript
interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}
```

#### Évaluation
```typescript
interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceStatus;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Action corrective
```typescript
interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
}
```

#### Suivi d'action
```typescript
interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceStatus;
  status: ActionStatus;
}
```

### Mapping avec Notion

Le mapping entre notre modèle de données et les bases Notion est défini explicitement pour chaque entité. Chaque base Notion a une structure correspondante bien définie avec des propriétés spécifiques.

## Gestion de l'état

### Principes de base
- Utilisation de hooks React pour l'état local des composants
- Context API pour l'état partagé entre plusieurs composants
- Possibilité d'utiliser TanStack Query pour la gestion des données serveur

### Accès aux données
- Hooks spécifiques pour chaque type d'entité (`useProjects`, `useAudits`, etc.)
- Interface unifiée quel que soit le mode (réel ou démo)
- Gestion du cache et de la revalidation via TanStack Query

### Mode opérationnel
- Context pour exposer le mode actuel (réel vs démo)
- Switch explicite entre les modes via une action utilisateur
- Pas de basculement automatique complexe

## Patterns validés

### Hooks de service
```typescript
// Exemple de hook d'accès aux données
function useProjects() {
  const { mode } = useOperationMode();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (mode === 'demo') {
        return mockProjects;
      }
      return api.getProjects();
    }
  });
}
```

### Composants UI
- Composants principalement sans état (stateless)
- Props explicites et typées
- Utilisation de l'héritage de props via le pattern de composition

### Pattern de formulaire
- Utilisation de React Hook Form pour la gestion des formulaires
- Validation via Zod avec schémas explicites
- Feedbacks d'erreur clairs et accessibles

### Gestion des erreurs
- Try/catch explicites dans les fonctions asynchrones
- Utilisation de React Error Boundary pour capturer les erreurs UI
- Affichage d'erreurs contextuel et informatif

## Anti-patterns à éviter

### Détection automatique de l'environnement
❌ Détection automatique complexe du mode ou de l'environnement  
✅ Configuration explicite du mode via une action utilisateur

### Basculement automatique entre modes
❌ Logique complexe de basculement automatique entre mode réel et démo  
✅ Choix explicite du mode avec indication claire dans l'UI

### Couches d'abstraction multiples
❌ Multiples couches d'adaptateurs et de proxies  
✅ Interface directe et simple vers les services externes

### Duplication des responsabilités
❌ Même logique implémentée à plusieurs endroits  
✅ Centralisation de la logique dans des hooks ou services spécifiques

### Gestion implicite des erreurs
❌ Masquer les erreurs ou les traiter silencieusement  
✅ Traitement explicite avec feedback utilisateur

## Interfaces clés

### API Notion
Interface unifiée pour communiquer avec l'API Notion, indépendante du mode.

```typescript
interface NotionAPI {
  // Projets
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project>;
  createProject(project: Omit<Project, 'id'>): Promise<Project>;
  updateProject(project: Project): Promise<Project>;
  
  // Checklists
  getChecklistItems(): Promise<ChecklistItem[]>;
  
  // Exigences
  getExigences(projectId: string): Promise<Exigence[]>;
  updateExigence(exigence: Exigence): Promise<Exigence>;
  
  // Échantillons de pages
  getSamplePages(projectId: string): Promise<SamplePage[]>;
  addSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage>;
  
  // Audits
  getAudits(projectId: string): Promise<Audit[]>;
  createAudit(audit: Omit<Audit, 'id'>): Promise<Audit>;
  
  // Évaluations
  getEvaluations(auditId: string): Promise<Evaluation[]>;
  updateEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  
  // Actions correctives
  getActions(evaluationId: string): Promise<CorrectiveAction[]>;
  updateAction(action: CorrectiveAction): Promise<CorrectiveAction>;
  
  // Progrès
  getActionProgress(actionId: string): Promise<ActionProgress[]>;
  addActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress>;
}
```

### OperationMode
Interface pour gérer le mode opérationnel (réel vs démo).

```typescript
interface OperationMode {
  mode: 'real' | 'demo';
  setMode(mode: 'real' | 'demo'): void;
  isDemoMode: boolean;
  isRealMode: boolean;
}
```

## Règles de développement

### Conventions de nommage
- Composants : PascalCase
- Hooks : camelCase avec préfixe "use"
- Fichiers de composants : PascalCase
- Fichiers de hooks : camelCase
- Constantes : UPPER_SNAKE_CASE
- Types et interfaces : PascalCase

### Règles ESLint
- no-unused-vars: error
- react-hooks/rules-of-hooks: error
- react-hooks/exhaustive-deps: warn
- @typescript-eslint/no-explicit-any: warn
- import/order: règles strictes pour l'ordre des imports

### Tests
- Tests unitaires pour la logique métier critique
- Tests de composants pour les composants UI complexes
- Tests d'intégration pour les flux principaux

### Documentation
- TSDoc pour les fonctions et composants publics
- README pour chaque dossier feature expliquant son rôle
- Commentaires pour la logique complexe

## Roadmap technique

### Phase 1 : Fondations (2 semaines)
- Structure du projet selon l'architecture définie
- Configuration TypeScript, ESLint, Prettier
- Mise en place des composants UI de base (shadcn/ui)
- Système de mode opérationnel (réel vs démo)

**Critères de qualité :**
- Typage complet de toutes les interfaces
- Tests pour les services fondamentaux
- Documentation des patterns principaux

### Phase 2 : Cœur métier (3 semaines)
- Implémentation des modèles de données
- Développement du client API Notion
- Création des hooks d'accès aux données
- Développement des écrans de gestion de projet

**Critères de qualité :**
- Coverage de tests > 70% pour la logique métier
- Gestion d'erreurs robuste
- Documentation des interfaces API

### Phase 3 : Feature d'audit (3 semaines)
- Implémentation des écrans de checklist
- Développement des fonctionnalités d'exigence
- Gestion des pages d'échantillon
- Interface d'évaluation d'audit

**Critères de qualité :**
- UX fluide et intuitive
- Performance optimale (pas de re-renders inutiles)
- Accessibilité conforme aux standards WCAG

### Phase 4 : Plans d'action (2 semaines)
- Développement des fonctionnalités d'actions correctives
- Interface de suivi des actions
- Tableaux de bord et visualisations

**Critères de qualité :**
- Expérience utilisateur cohérente
- Visualisations performantes
- Tests d'utilisabilité validés

### Phase 5 : Finalisation (2 semaines)
- Optimisations de performance
- Exportation de données et rapports
- Documentation utilisateur
- Tests finaux et corrections de bugs

**Critères de qualité :**
- Tous les flux utilisateurs testés
- Documentation complète
- Performances optimales même avec de grands volumes de données

## Critères de validation du code

Chaque Pull Request ou contribution devra respecter les critères suivants :

1. **Conformité architecturale**
   - Respect de la structure de fichiers
   - Pas d'introduction de nouveaux patterns non validés
   - Respect des interfaces définies

2. **Qualité du code**
   - Pas d'erreurs de linting
   - Types complets et précis
   - Tests appropriés
   - Pas de code commenté ou TODO sans ticket associé

3. **Expérience utilisateur**
   - Interface cohérente avec le reste de l'application
   - Accessibilité préservée
   - Performance adéquate

4. **Documentation**
   - TSDoc pour les fonctions et composants publics
   - Mise à jour des README si nécessaire
   - Commentaires pour la logique complexe

Les revues de code se concentreront particulièrement sur ces critères pour garantir l'alignement avec la vision architecturale.

