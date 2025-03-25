
# API Notion - Guide de Migration

Ce document explique comment migrer de l'ancien système d'API Notion vers le nouveau service centralisé.

## Deux façons d'utiliser l'API Notion

### 1. Ancienne façon (compatible)

```typescript
import { notionApi } from '@/lib/notionProxy';

// Obtenir des données
const projects = await notionApi.getProjects();
const project = await notionApi.getProject('project-id');

// Vérifier le mockMode
if (notionApi.mockMode.isActive()) {
  // ...
}
```

### 2. Nouvelle façon (recommandée)

```typescript
import { notionService } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

// Obtenir des données
const projects = await notionService.projects.getAll();
const project = await notionService.projects.getById('project-id');

// Vérifier le mode démo
if (operationMode.isDemoMode) {
  // ...
}
```

## Avantages de la nouvelle approche

- Typages plus cohérents et précis
- Structure plus claire et organisée
- Meilleure gestion des erreurs
- Un service unique centralisé pour tous les appels à l'API Notion
- Évite les problèmes CORS en acheminant toutes les requêtes via le proxy Netlify

## Guide de migration complet

Consultez le document `MIGRATION.md` pour un guide étape par étape sur la façon de migrer votre code.
