
# Tests de non-régression pour operationMode

Ce dossier contient des tests de non-régression pour le système operationMode avant sa refactorisation.

## Pourquoi ces tests ?

Avant de procéder à la suppression et la simplification du système operationMode, nous avons
besoin de garantir que les fonctionnalités essentielles sont préservées et que les comportements
attendus continuent de fonctionner correctement.

## Tests inclus

1. **operationMode.test.ts** - Tests pour le service principal operationMode
2. **errorReporter.test.ts** - Tests pour le hook useErrorReporter
3. **criticalOperation.test.ts** - Tests pour le hook useCriticalOperation
4. **operationQueue.test.ts** - Tests pour le hook useOperationQueue

## Utilisation

Pour exécuter ces tests, utilisez la commande :

```bash
npm run test:regression
```

## Procédure manuelle de test

En plus des tests automatisés, voici une liste de vérifications manuelles à effectuer :

### 1. Test du basculement de mode

- Ouvrir l'application et vérifier le mode initial
- Basculer manuellement entre les modes via l'interface utilisateur
- Vérifier que le mode est persistant après rechargement de la page

### 2. Test de la gestion des erreurs

- Provoquer une erreur de connexion (par exemple en déconnectant le réseau)
- Vérifier que l'erreur est bien affichée à l'utilisateur
- Vérifier si le mode bascule automatiquement après plusieurs erreurs

### 3. Test des opérations critiques

- Effectuer une opération marquée comme critique
- Vérifier que l'opération ne provoque pas de basculement automatique

### 4. Test de l'intégration Notion

- Vérifier l'état de connexion à Notion
- Tester les erreurs spécifiques à Notion (authentification, autorisation)
- Vérifier que les erreurs sont correctement affichées à l'utilisateur
