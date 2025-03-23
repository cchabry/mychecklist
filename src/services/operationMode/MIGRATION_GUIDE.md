
# Guide de migration vers OperationMode

Ce guide explique comment migrer du système `mockMode` vers le nouveau système `operationMode` qui offre une gestion plus robuste des modes opérationnels de l'application.

## Pourquoi migrer ?

Le système `operationMode` présente plusieurs avantages :

- Architecture plus robuste et séparée des préoccupations
- Gestion automatique du basculement en cas d'erreurs réseau
- Meilleure intégration avec le système de notification
- API plus cohérente et mieux typée
- Persistance configurable de l'état entre les sessions

## Étapes de migration

### 1. Remplacer les importations

```diff
- import { notionApi } from '@/lib/notionProxy';
- import { mockMode } from '@/lib/notionProxy/mockMode';
+ import { useOperationMode } from '@/services/operationMode';
```

### 2. Remplacer les vérifications d'état

```diff
- const isMockMode = notionApi.mockMode.isActive();
+ const { isDemoMode } = useOperationMode();

// Dans les conditions
- if (mockMode.isActive()) {
+ if (isDemoMode) {
```

### 3. Remplacer les changements d'état

```diff
- mockMode.activate();
+ const { enableDemoMode } = useOperationMode();
+ enableDemoMode('Raison du changement');

- mockMode.deactivate();
+ const { enableRealMode } = useOperationMode();
+ enableRealMode();

- mockMode.toggle();
+ const { toggle } = useOperationMode();
+ toggle();
```

### 4. Utiliser les nouveaux hooks pour les requêtes API

Le hook `useNotionAPI` remplace l'ancienne approche conditionnelle :

```typescript
// Ancienne approche
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      if (notionApi.mockMode.isActive()) {
        setData(mockData);
      } else {
        const result = await notionApi.fetchData();
        setData(result);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  fetchData();
}, []);

// Nouvelle approche avec useNotionAPI
const { executeOperation, isLoading, error } = useNotionAPI();
const [data, setData] = useState(null);

const fetchData = async () => {
  try {
    const result = await executeOperation(
      () => notionApi.fetchData(),
      { demoData: mockData }
    );
    setData(result);
  } catch (error) {
    // L'erreur est déjà gérée par le hook
  }
};

useEffect(() => {
  fetchData();
}, []);
```

### 5. Signaler les erreurs et les succès

Pour une meilleure résilience, utilisez les méthodes de signalement :

```typescript
const { handleConnectionError, handleSuccessfulOperation } = useOperationMode();

// En cas d'erreur réseau
try {
  // opération...
} catch (error) {
  handleConnectionError(error, "Contexte de l'opération");
}

// En cas de succès
handleSuccessfulOperation();
```

Ou utilisez le hook utilitaire `useErrorReporter` :

```typescript
const { reportError, reportSuccess } = useErrorReporter();

// En cas d'erreur
reportError(error, "Contexte", { showToast: true });

// En cas de succès
reportSuccess();
```

## Composants UI

Remplacez les anciens composants de contrôle par les nouveaux :

```diff
- import MockModeToggle from '@/components/MockModeToggle';
+ import OperationModeControl from '@/components/OperationModeControl';
  
// Dans le JSX
- <MockModeToggle />
+ <OperationModeControl />
```

## Période de transition

Pendant la période de transition, les anciens APIs continueront à fonctionner mais afficheront des avertissements de dépréciation dans la console. Ils seront supprimés dans une future version.

## Besoin d'aide ?

Consultez les exemples dans `src/examples/NotionAPIExample.tsx` ou contactez l'équipe de développement.
