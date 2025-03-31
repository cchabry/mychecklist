
# Guide de migration - Ancien vers Nouveau système Notion

Ce guide explique comment migrer votre code depuis l'ancien système Notion vers la nouvelle architecture.

## 1. Changements majeurs

### Remplacements directs

| Ancien système | Nouveau système | Notes |
|----------------|----------------|-------|
| `notionApi` | `notionService` | Nouvelle API plus cohérente |
| `mockMode` | `operationMode` | Gestion plus complète des modes |
| `useNotionRequest` | `useNotionAPI` | Support amélioré du mode démo et gestion d'erreurs |
| `NotionConfigDialog` | `NotionServiceProvider` + `useNotionService` | Approche contextuelle |

### Concepts remplacés

1. **Mode Mock** → **Mode Opérationnel**
   - Plus flexible et contextuel
   - Transition automatique basée sur les erreurs
   - Interface utilisateur intégrée

2. **Proxy CORS direct** → **Architecture de proxy abstraite**
   - Adaptateurs par environnement
   - Détection automatique
   - Meilleure extensibilité

3. **Gestion manuelle des erreurs** → **Système de monitoring centralisé**
   - Rapports d'erreur standardisés
   - Comptage et agrégation
   - Suggestions de résolution

## 2. Guide de migration étape par étape

### 1. Mise à jour des imports

```typescript
// Ancien
import { notionApi } from '@/lib/notionProxy';
import mockMode from '@/lib/notionProxy/mock/mode';

// Nouveau
import { notionService } from '@/services/notion/client';
import { useNotionService } from '@/contexts/NotionServiceContext';
import { operationMode } from '@/services/operationMode';
```

### 2. Configuration et initialisation

```typescript
// Ancien
notionApi.configure('secret_XXXXX', 'database_id');
mockMode.deactivate();

// Nouveau
// Dans un composant React
const { setNotionConfig, testConnection } = useNotionService();
setNotionConfig('secret_XXXXX', 'database_id');
await testConnection();

// OU directement si nécessaire
notionService.configure('secret_XXXXX', 'database_id');
operationMode.enableRealMode();
```

### 3. Requêtes API

```typescript
// Ancien
try {
  const response = await notionApi.databases.query('database_id', {
    filter: { property: 'Status', status: { equals: 'Active' } }
  });
  
  if (response.success) {
    setProjects(response.data.results);
  } else {
    console.error('Erreur:', response.error);
  }
} catch (error) {
  console.error('Exception:', error);
}

// Nouveau
import { useNotionAPI } from '@/hooks/useNotionApi';

const { execute, isLoading, error } = useNotionAPI();

try {
  const results = await execute(
    `/databases/database_id/query`,
    'POST',
    { filter: { property: 'Status', status: { equals: 'Active' } } },
    undefined,
    {
      demoData: mockProjects,
      showLoadingToast: true,
      messages: {
        loading: 'Chargement des projets...',
        success: 'Projets chargés',
        error: 'Échec du chargement'
      }
    }
  );
  
  setProjects(results.results);
} catch (error) {
  // L'erreur est déjà gérée par le hook
}
```

### 4. Gestion du mode démonstration

```typescript
// Ancien
if (notionApi.mockMode.isActive()) {
  // Code pour le mode mock
} else {
  // Code pour le mode réel
}

notionApi.mockMode.toggle();

// Nouveau
import { useOperationMode } from '@/services/operationMode';

const { isDemoMode, toggle } = useOperationMode();

if (isDemoMode) {
  // Code pour le mode démonstration
} else {
  // Code pour le mode réel
}

toggle(); // Basculer entre les modes
```

### 5. Affichage du statut de connexion

```typescript
// Ancien
import NotionConnectionStatus from '@/components/NotionConnectionStatus';

<NotionConnectionStatus 
  isConnected={isConnected} 
  isLoading={isLoading} 
  error={error}
  onConfig={handleConfigClick} 
/>

// Nouveau
import NotionConnectionStatusUpdated from '@/components/NotionConnectionStatusUpdated';
import OperationModeStatus from '@/components/OperationModeStatus';

<NotionConnectionStatusUpdated 
  onConfigClick={handleConfigClick}
  onReset={handleResetClick}
/>

// Ou simplement l'indicateur de mode
<OperationModeStatus showToggle={true} />
```

### 6. OAuth et authentification

```typescript
// Ancien (OAuth basique ou pas supporté)
// ...

// Nouveau - Support OAuth complet
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';

const { 
  isAuthenticated, 
  startOAuthFlow, 
  refreshToken,
  logout,
  tokenWillExpireSoon
} = useNotionOAuth({
  autoRefresh: true,
  onTokenRefreshed: () => console.log('Token rafraîchi')
});

// Démarrer le flux OAuth
<Button onClick={startOAuthFlow}>
  Se connecter avec Notion
</Button>

// Monitorer l'expiration des tokens
<OAuthTokenMonitor />
```

## 3. Exemples de migration complets

### Exemple 1: Page principale avec liste de projets

```typescript
// AVANT
import React, { useEffect, useState } from 'react';
import { notionApi } from '@/lib/notionProxy';
import mockMode from '@/lib/notionProxy/mock/mode';
import ProjectList from '@/components/ProjectList';
import NotionConnectionStatus from '@/components/NotionConnectionStatus';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionApi.databases.query('database_id', {
        filter: { property: 'Status', status: { equals: 'Active' } }
      });
      
      if (response.success) {
        setProjects(response.data.results);
      } else {
        setError(response.error.message);
        if (!mockMode.isActive()) {
          mockMode.activate();
        }
      }
    } catch (error) {
      setError(error.message);
      mockMode.activate();
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  return (
    <div>
      <NotionConnectionStatus 
        isConnected={!mockMode.isActive()} 
        isLoading={isLoading} 
        error={error}
        onConfig={() => {}} 
      />
      
      <ProjectList 
        projects={projects} 
        isLoading={isLoading} 
        error={error} 
        onRefresh={loadProjects}
      />
    </div>
  );
};
```

```typescript
// APRÈS
import React, { useEffect } from 'react';
import { useNotionAPI } from '@/hooks/useNotionApi';
import { useNotionService } from '@/contexts/NotionServiceContext';
import ProjectList from '@/components/ProjectList';
import NotionConnectionStatusUpdated from '@/components/NotionConnectionStatusUpdated';

const ProjectPage = () => {
  const { isConnected, openConfig } = useNotionService();
  
  const { 
    execute, 
    isLoading, 
    error, 
    isDemoMode 
  } = useNotionAPI();
  
  const [projects, setProjects] = useState([]);
  
  const loadProjects = async () => {
    try {
      const response = await execute(
        `/databases/database_id/query`,
        'POST',
        { filter: { property: 'Status', status: { equals: 'Active' } } },
        undefined,
        {
          demoData: mockProjects,
          showLoadingToast: true,
          messages: {
            loading: 'Chargement des projets...',
            success: 'Projets chargés',
            error: 'Échec du chargement'
          },
          cacheOptions: {
            enabled: true,
            ttl: 5 * 60 * 1000 // 5 minutes
          }
        }
      );
      
      setProjects(response.results);
    } catch (err) {
      // Erreur déjà gérée par le hook
    }
  };
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  return (
    <div>
      <NotionConnectionStatusUpdated 
        onConfigClick={openConfig}
        onReset={loadProjects}
      />
      
      <ProjectList 
        projects={projects} 
        isLoading={isLoading} 
        error={error} 
        onRefresh={loadProjects}
        isDemoMode={isDemoMode}
      />
    </div>
  );
};
```

## 4. Fonctionnalités obsolètes et leurs remplacements

| Fonctionnalité obsolète | Remplacement | Notes |
|------------------------|--------------|-------|
| `notionApi.setCorsProxy()` | Supprimé - géré automatiquement | Le proxy est désormais géré par l'architecture d'adaptateurs |
| `mockMode.temporarilyForceReal()` | `operationMode.temporarilyForceReal()` | Même fonctionnalité, nouvelle API |
| `mockState.getConfig()` | `operationMode.getSettings()` | Configuration plus riche |
| Fichiers `mock/data/*.js` | Conservés pour compatibilité | Préférez les données de démo inline avec `demoData` |

## 5. Planning de dépréciation

Cette migration devrait être réalisée progressivement :

1. **Phase 1 (Immédiat)** : Utiliser les adaptateurs de compatibilité
   - `import { notionApi } from '@/services/notion/compatibility'`
   - Comportement identique à l'ancien système

2. **Phase 2 (1-3 mois)** : Migrer vers les nouveaux hooks et composants
   - Remplacer `notionApi` par `useNotionAPI` et `notionService`
   - Utiliser les nouveaux composants UI

3. **Phase 3 (3-6 mois)** : Retirer les adaptateurs de compatibilité
   - Suppression complète de l'ancien système
   - Tous les appels directs `notionApi.*` doivent être remplacés
