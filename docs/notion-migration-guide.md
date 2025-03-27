
# Guide de migration vers la nouvelle infrastructure Notion

Ce guide explique comment migrer du code existant vers la nouvelle architecture Notion.

## Pourquoi migrer ?

La nouvelle architecture apporte plusieurs avantages:
- Séparation claire des modes réel et démo
- Meilleure gestion des erreurs
- Architecture plus modulaire et testable
- Performances améliorées grâce au cache
- Code plus maintenable

## Étapes de migration

### 1. Mise à jour des imports

#### Avant:
```typescript
import { notionClient } from '@/services/notion/notionClient';
```

#### Après:
```typescript
import { notionClient } from '@/services/notion/client';
// OU plus spécifiquement si nécessaire
import { notionClient } from '@/services/notion/client/notionClient';
```

### 2. Utilisation des services de domaine

Au lieu d'utiliser directement le client Notion, préférez utiliser les services de domaine spécifiques.

#### Avant:
```typescript
import { notionClient } from '@/services/notion/notionClient';

async function getProjects() {
  const response = await notionClient.post('/databases/db-id/query', {
    filter: { /* ... */ }
  });
  
  return response.success ? response.data : [];
}
```

#### Après:
```typescript
import { projectService } from '@/services/notion/project/projectService';

async function getProjects() {
  const response = await projectService.getProjects();
  return response.success ? response.data : [];
}
```

### 3. Gestion des erreurs

#### Avant:
```typescript
try {
  const response = await notionClient.get('/some-endpoint');
  if (!response.success) {
    console.error('Erreur:', response.error);
    // Gestion manuelle
  }
} catch (error) {
  console.error('Exception:', error);
}
```

#### Après:
```typescript
import { useNotionErrorHandler } from '@/hooks/notion/useNotionErrorHandler';

function MyComponent() {
  const { handleNotionError } = useNotionErrorHandler();
  
  async function fetchData() {
    try {
      const response = await notionService.getData();
      return response.data;
    } catch (error) {
      handleNotionError(error, {
        toastTitle: 'Erreur de chargement',
        endpoint: '/some-endpoint'
      });
    }
  }
}
```

### 4. Utilisation du mode opérationnel

#### Avant:
```typescript
const useMockData = process.env.NODE_ENV === 'development' || 
                   localStorage.getItem('use_mock') === 'true';

function getData() {
  if (useMockData) {
    return mockData;
  } else {
    // Appel API réel
  }
}
```

#### Après:
```typescript
import { useOperationMode } from '@/hooks/useOperationMode';

function MyComponent() {
  const { isDemoMode } = useOperationMode();
  
  // Le client Notion gère déjà automatiquement le mode
  async function fetchData() {
    const response = await notionService.getData();
    return response.data;
  }
  
  // Pour des logiques spécifiques au mode
  function renderSpecialContent() {
    if (isDemoMode) {
      return <DemoContent />;
    } else {
      return <RealContent />;
    }
  }
}
```

### 5. Configuration

#### Avant:
```typescript
notionClient.configure({
  apiKey: 'ma-clé',
  // Autres options...
});
```

#### Après:
```typescript
import { notionBaseService } from '@/services/notion/notionBaseService';

// La méthode a été simplifiée
notionBaseService.configure(
  'ma-clé-api',
  'id-base-projets',
  'id-base-checklist'
);
```

## Checklist de migration

- [ ] Mettre à jour les imports pour utiliser les nouveaux chemins
- [ ] Remplacer les appels directs au client par les services de domaine
- [ ] Utiliser le hook `useNotionErrorHandler` pour la gestion des erreurs
- [ ] Remplacer les vérifications manuelles de mode par `useOperationMode`
- [ ] Mettre à jour les appels de configuration

## Exemples de migration complets

Voir le document [exemples d'utilisation](./notion-usage-examples.md) pour des exemples complets de migration.
