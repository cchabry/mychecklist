
# Guide de développement

Ce document fournit des conseils et bonnes pratiques pour le développement de l'application d'audit d'accessibilité.

## Structure des fichiers

L'application suit une architecture en couches avec une séparation claire des responsabilités:

```
/src
  /components        # Composants UI réutilisables
  /features          # Fonctionnalités principales organisées par domaine
    /domain-name     # Dossier par domaine fonctionnel
      /components    # Composants spécifiques à cette feature
      /hooks         # Hooks spécifiques à cette feature
      types.ts       # Types spécifiques à cette feature
      utils.ts       # Utilitaires spécifiques à cette feature
      constants.ts   # Constantes spécifiques à cette feature
      index.ts       # Point d'entrée exportant les éléments publics
  /hooks             # Hooks React personnalisés
  /services          # Services et logique métier
  /types             # Définitions de types TypeScript
  /utils             # Utilitaires et fonctions helpers
  /contexts          # Contextes React
  /pages             # Pages de l'application
```

## Organisation des features

Chaque feature est organisée selon le pattern suivant :

```
/feature-name
  /components        # Composants spécifiques à la feature
  /hooks             # Hooks spécifiques à la feature
  types.ts           # Types spécifiques à la feature
  utils.ts           # Utilitaires spécifiques à la feature
  constants.ts       # Constantes spécifiques à la feature
  index.ts           # Point d'entrée exportant les éléments publics
```

Le fichier `index.ts` de chaque feature exporte tous les éléments publics de la feature, y compris ses fonctions, ses composants et ses hooks. Cela facilite l'importation et l'utilisation de la feature depuis d'autres parties de l'application.

## Conventions de code

### Nommage

- **Composants**: PascalCase (ex: `ProjectCard.tsx`)
- **Hooks**: camelCase avec préfixe "use" (ex: `useProjects.ts`)
- **Services**: camelCase avec suffixe "Service" (ex: `notionService.ts`)
- **Types/Interfaces**: PascalCase (ex: `Project`, `ApiResponse`)
- **Fonctions**: camelCase (ex: `getProjects`, `handleError`)

### Documentation

- Utiliser TSDoc pour documenter les fonctions, composants et interfaces publiques
- Format recommandé:

```typescript
/**
 * Description de la fonction
 *
 * @param paramName - Description du paramètre
 * @returns Description de la valeur de retour
 * @throws Conditions dans lesquelles des erreurs peuvent être lancées
 * @example
 * // Exemple d'utilisation
 * const result = maFonction('valeur');
 */
```

## Gestion des erreurs

L'application utilise un système de gestion d'erreurs standardisé:

1. Toutes les erreurs devraient être converties en `AppError` avec un type spécifique
2. Utiliser le hook `useErrorHandler` pour gérer les erreurs de manière cohérente
3. Options de gestion d'erreurs:
   - `showToast`: Afficher une notification toast
   - `logToConsole`: Logger l'erreur en console
   - `onError`: Callback personnalisé pour des actions spécifiques

## Mode opérationnel

L'application supporte deux modes d'opération:

1. **Mode réel**: Utilise l'API Notion pour les données réelles
2. **Mode démonstration**: Utilise des données mockées pour le développement et les démos

Vérifier le mode actuel avec `useOperationMode` avant d'effectuer des opérations.

## Développement de features

Lors du développement d'une nouvelle feature:

1. Créer un dossier pour la feature dans `/src/features`
2. Suivre la structure standard (components, hooks, types, etc.)
3. Exporter tous les éléments publics via `index.ts`
4. Utiliser les services existants pour accéder aux données
5. Documenter la feature avec TSDoc

## Flux de travail Git

1. Créer une branche par fonctionnalité (`feature/nom-fonctionnalité`)
2. Commits atomiques avec messages descriptifs
3. Pull requests avec description des changements
4. Code review obligatoire avant merge

## Tests

- Tests unitaires pour les hooks et services
- Tests de composants pour les éléments UI complexes
- Tests d'intégration pour les flux principaux

## Documentation continue

Mettre à jour cette documentation au fur et à mesure que l'architecture évolue.
