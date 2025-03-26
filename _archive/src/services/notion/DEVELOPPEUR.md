
# Guide du développeur - Intégration Notion

Ce guide explique comment utiliser l'infrastructure Notion dans votre application, en mettant l'accent sur les meilleures pratiques et les nouvelles fonctionnalités.

## 1. Configuration de base

### Importer les services nécessaires

```typescript
import { notionService } from '@/services/notion/client';
import { useNotionService } from '@/contexts/NotionServiceContext';
```

### Configurer l'API Notion

```typescript
// Avec une clé d'API d'intégration
notionService.configure('secret_XXXXX', 'database_id');

// Avec OAuth (recommandé pour les applications multi-utilisateur)
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';

const { startOAuthFlow } = useNotionOAuth();
startOAuthFlow(); // Redirige l'utilisateur vers la page d'autorisation Notion
```

## 2. Utilisation des hooks

### Hook principal (recommandé)

```typescript
const { 
  isConnected, 
  isOAuthToken,
  lastError,
  notion, 
  testConnection,
  refreshOAuthToken
} = useNotionService();

// Tester la connexion
const handleTest = async () => {
  const result = await testConnection();
  if (result.success) {
    console.log('Connecté en tant que:', result.data.user);
  }
};
```

### Hooks spécialisés

```typescript
// Pour le monitoring d'erreurs
import { useErrorReporter } from '@/hooks/useErrorReporter';

const { reportError, reportSuccess } = useErrorReporter();

try {
  await someNotionOperation();
  reportSuccess('Opération réussie');
} catch (error) {
  reportError(error, 'Contexte de l\'opération');
}

// Pour la gestion du mode opérationnel
import { useOperationMode } from '@/services/operationMode';

const { isDemoMode, enableRealMode, enableDemoMode } = useOperationMode();

// Afficher l'état du mode
const modeLabel = isDemoMode ? 'Mode démonstration actif' : 'Mode réel actif';
```

## 3. Appels API à Notion

### Utilisation recommandée

```typescript
import { useNotionAPI } from '@/hooks/useNotionApi';

const { execute } = useNotionAPI();

const fetchProjects = async () => {
  return await execute<Project[]>(
    '/databases/your_database_id/query',
    'POST',
    { filter: { property: 'Status', status: { equals: 'Active' } } },
    undefined,
    {
      demoData: mockProjects, // Données pour le mode démonstration
      showLoadingToast: true,
      messages: {
        loading: 'Chargement des projets...',
        success: 'Projets chargés avec succès',
        error: 'Échec du chargement des projets'
      }
    }
  );
};
```

### Avec mise en cache

```typescript
const getPages = async (projectId: string) => {
  return await execute<Page[]>(
    `/databases/pages_db_id/query`,
    'POST',
    { filter: { property: 'Project', relation: { contains: projectId } } },
    undefined,
    {
      cacheOptions: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        key: `project:${projectId}:pages`
      }
    }
  );
};
```

## 4. Mode démonstration

Le mode démonstration permet de faire fonctionner l'application sans connexion réelle à Notion, idéal pour le développement, les tests ou les démos.

### Activation manuelle

```typescript
import { operationMode } from '@/services/operationMode';

// Activer le mode démonstration
operationMode.enableDemoMode('Raison de l\'activation');

// Revenir au mode réel
operationMode.enableRealMode();

// Basculer entre les modes
operationMode.toggle();
```

### Gestion via l'interface utilisateur

```typescript
import OperationModeControl from '@/components/OperationModeControl';
import OperationModeStatus from '@/components/OperationModeStatus';

// Dans un composant
return (
  <div>
    {/* Indicateur de statut */}
    <OperationModeStatus showToggle={true} />
    
    {/* Contrôle complet */}
    <OperationModeControl />
  </div>
);
```

## 5. Gestion des erreurs

### Rapports d'erreur

```typescript
import { useErrorReporter } from '@/hooks/useErrorReporter';

const { reportError } = useErrorReporter();

try {
  // Code susceptible d'échouer
} catch (error) {
  reportError(error, 'Contexte de l\'opération', {
    showToast: true,
    toastMessage: 'Message d\'erreur personnalisé',
    isCritical: true // Erreurs critiques peuvent activer le mode démo automatiquement
  });
}
```

### Affichage des erreurs

```typescript
import { NotionErrorDisplay } from '@/components/notion/NotionErrorDisplay';

// Dans un composant
return (
  <div>
    {error && (
      <NotionErrorDisplay
        error={error}
        context="Contexte de l'erreur"
        onRetry={handleRetry}
        showResetButton={true}
      />
    )}
  </div>
);
```

## 6. OAuth et Tokens

### Gestion du flux OAuth complet

```typescript
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';
import OAuthTokenMonitor from '@/components/notion/security/OAuthTokenMonitor';

// Dans un composant fonctionnel
const { 
  isAuthenticated, 
  tokenWillExpireSoon,
  startOAuthFlow, 
  refreshToken,
  logout
} = useNotionOAuth({
  autoRefresh: true,
  onTokenRefreshed: () => console.log('Token rafraîchi')
});

// Surveiller automatiquement l'expiration des tokens
return (
  <>
    <YourComponent />
    <OAuthTokenMonitor 
      warningThreshold={30 * 60 * 1000} // 30 minutes
      onTokenRefreshed={() => console.log('Token rafraîchi')}
    />
  </>
);
```

### Sécurisation des tokens

Les tokens sont automatiquement chiffrés avant d'être stockés dans le localStorage. Le chiffrement utilise AES-GCM avec une clé dérivée d'informations spécifiques au navigateur.

## 7. Bonnes pratiques

1. **Toujours gérer les erreurs** : Utilisez try/catch et le hook `useErrorReporter`
2. **Fournir des données de démo** : Pour chaque appel API, incluez des données de démonstration
3. **Utiliser la mise en cache** : Activez le cache pour les requêtes fréquentes et immuables
4. **Surveiller les tokens OAuth** : Intégrez `OAuthTokenMonitor` pour la gestion automatique
5. **Privilégier les hooks de haut niveau** : Utilisez `useNotionService` plutôt que d'accéder directement aux services
6. **Tester les deux modes** : Assurez-vous que votre code fonctionne en mode réel et en mode démonstration

## 8. Dépannage

### Problèmes courants

1. **Erreurs CORS** : Utilisez le proxy API intégré pour toutes les requêtes
2. **Tokens expirés** : Implémentez le rafraîchissement automatique avec `useNotionOAuth`
3. **Données incohérentes** : Effacez le cache avec `cache.clear()` ou `cache.remove(key)`

### Outils de diagnostic

```typescript
import { notionDiagnostics } from '@/services/notion/diagnostics';

// Exécuter un diagnostic complet
const results = await notionDiagnostics.runFullDiagnostic();
console.log(results);

// Tester une connexion spécifique
const connectionTest = await notionDiagnostics.testConnection('secret_XXXXX');
```
