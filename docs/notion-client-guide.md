
# Guide d'utilisation du client Notion

Ce document explique comment utiliser le client Notion unifié pour interagir avec l'API Notion dans notre application.

## Vue d'ensemble

Le client Notion est conçu selon une architecture modulaire qui:
- Gère automatiquement la bascule entre le mode réel et le mode démo
- Normalise la gestion des erreurs
- Fournit un cache pour améliorer les performances
- Simplifie l'écriture des tests

## Architecture du client

```
/services/notion/client/
├── notionClient.ts       # Client unifié (façade)
├── notionHttpClient.ts   # Client HTTP pour le mode réel
├── mock/                 # Implémentations pour le mode démo
│   ├── notionMockClient.ts       # Client mock
│   └── mockDataGenerators.ts     # Générateurs de données
├── connectionTester.ts   # Test de connexion
└── errorHandler.ts       # Gestionnaire d'erreurs
```

## Utilisation de base

### Configuration du client

```typescript
import { notionClient } from '@/services/notion/client';

// Configuration manuelle
notionClient.configure({
  apiKey: 'votre-clé-api',
  projectsDbId: 'id-base-projets',
  checklistsDbId: 'id-base-checklist',
  mockMode: false, // Optionnel, false par défaut
  debug: false     // Optionnel, false par défaut
});

// Vérifier si le client est configuré
const isConfigured = notionClient.isConfigured();
```

### Requêtes API

```typescript
// Récupérer des données (GET)
const response = await notionClient.get('/databases/db-id/query');

// Créer des données (POST)
const newItem = await notionClient.post('/pages', {
  parent: { database_id: 'db-id' },
  properties: { /* ... */ }
});

// Mettre à jour des données (PATCH)
const updatedItem = await notionClient.patch('/pages/page-id', {
  properties: { /* ... */ }
});

// Supprimer des données (DELETE)
const deleteResult = await notionClient.delete('/blocks/block-id');
```

### Tester la connexion

```typescript
const testResult = await notionClient.testConnection();

if (testResult.success) {
  console.log(`Connecté en tant que: ${testResult.user}`);
  console.log(`Workspace: ${testResult.workspaceName}`);
} else {
  console.error(`Erreur: ${testResult.error}`);
}
```

## Mode Mock/Démo

Le client peut fonctionner en mode mock, ce qui est utile pour le développement et les tests.

```typescript
// Activer manuellement le mode mock
notionClient.setMockMode(true);

// Vérifier si le mode mock est actif
const isMockMode = notionClient.isMockMode();
```

Notez que le mode mock est automatiquement activé en mode démo via le service `operationModeService`.

## Gestion des erreurs

Le client normalise les erreurs de l'API Notion:

```typescript
try {
  const response = await notionClient.get('/databases/invalid-id');
  
  if (!response.success) {
    console.error(`Erreur: ${response.error?.message}`);
    console.error(`Code: ${response.error?.code}`);
    console.error(`Statut: ${response.error?.status}`);
  }
} catch (error) {
  // Erreurs non gérées par le client
}
```

## Bonnes pratiques

1. **Utiliser les services de domaine** plutôt que d'appeler directement le client
2. **Gérer les erreurs** avec le hook `useNotionErrorHandler`
3. **Vérifier le mode** avec `isMockMode()` pour des comportements spécifiques
4. **Utiliser les types** pour garantir la cohérence des données

## Débogage

Le mode debug peut être activé pour obtenir plus d'informations sur les requêtes:

```typescript
notionClient.setDebugMode(true);
```

## Migration depuis l'ancien client

Voir le [guide de migration](./notion-migration-guide.md) pour migrer depuis l'ancien client Notion.
