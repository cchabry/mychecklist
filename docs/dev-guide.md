
# Guide de développement

Ce document fournit des conseils et bonnes pratiques pour le développement de l'application d'audit d'accessibilité.

## Structure des fichiers

L'application suit une architecture en couches avec une séparation claire des responsabilités:

```
/src
  /components        # Composants UI réutilisables
  /features          # Fonctionnalités principales organisées par domaine
  /hooks             # Hooks React personnalisés
  /services          # Services et logique métier
  /types             # Définitions de types TypeScript
  /utils             # Utilitaires et fonctions helpers
  /contexts          # Contextes React
  /pages             # Pages de l'application
```

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
