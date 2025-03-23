
# Guide de migration du système de gestion des modes opérationnels

Ce document décrit les étapes pour migrer de l'ancien système `mockMode` vers le nouveau système `operationMode` plus robuste et flexible.

## 1. Pour les composants UI

### Avant (avec mockMode)

```jsx
import { useEffect, useState } from 'react';
import { notionApi } from '@/lib/notionProxy';

const MyComponent = () => {
  const [isMockMode, setIsMockMode] = useState(notionApi.mockMode.isActive());
  
  // Écouter les changements de mode
  useEffect(() => {
    const unsubscribe = notionApi.mockMode.subscribe(newMode => {
      setIsMockMode(newMode);
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <div>
      Mode actuel: {isMockMode ? 'Démonstration' : 'Réel'}
      <button onClick={() => notionApi.mockMode.toggle()}>
        Changer de mode
      </button>
    </div>
  );
};
```

### Après (avec operationMode)

```jsx
import { useOperationMode } from '@/services/operationMode';

const MyComponent = () => {
  const { isDemoMode, toggle } = useOperationMode();
  
  return (
    <div>
      Mode actuel: {isDemoMode ? 'Démonstration' : 'Réel'}
      <button onClick={toggle}>
        Changer de mode
      </button>
    </div>
  );
};
```

## 2. Pour les services et hooks d'API

### Avant (avec mockMode)

```typescript
import { useState } from 'react';
import { notionApi } from '@/lib/notionProxy';

export function useMyApiCall() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Vérifier si on est en mode mock
      if (notionApi.mockMode.isActive()) {
        const mockData = { /* données simulées */ };
        setData(mockData);
      } else {
        // Appel réel à l'API
        const result = await fetch('/api/endpoint');
        const data = await result.json();
        setData(data);
      }
    } catch (error) {
      console.error(error);
      // Activer automatiquement le mode mock en cas d'erreur
      notionApi.mockMode.activate();
    } finally {
      setIsLoading(false);
    }
  };
  
  return { fetchData, isLoading, data };
}
```

### Après (avec le nouveau useNotionAPI)

```typescript
import { useNotionAPI } from '@/hooks/useNotionAPI';

export function useMyApiCall() {
  const { executeOperation, isLoading, error } = useNotionAPI();
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
      const result = await executeOperation(
        // Fonction pour l'API réelle
        () => fetch('/api/endpoint').then(res => res.json()),
        {
          // Données à utiliser en mode démonstration
          demoData: { /* données simulées */ },
          // Messages personnalisés pour les toasts
          messages: {
            loading: 'Chargement des données...',
            success: 'Données chargées avec succès',
            error: 'Erreur lors du chargement des données'
          }
        }
      );
      
      setData(result);
    } catch (err) {
      // L'erreur est déjà gérée par executeOperation
      console.error('Erreur supplémentaire:', err);
    }
  };
  
  return { fetchData, isLoading, data, error };
}
```

## 3. Gestion avancée des erreurs

Le nouveau système opérationnel fournit une gestion des erreurs plus robuste :

```typescript
import { useErrorReporter } from '@/hooks/useErrorReporter';

export function myFunction() {
  const { reportError, reportSuccess } = useErrorReporter();
  
  try {
    // Effectuer une opération
    await someOperation();
    
    // Signaler un succès
    reportSuccess('Opération réussie');
  } catch (error) {
    // Signaler une erreur avec contexte
    reportError(error, 'Context de l\'erreur', {
      showToast: true,
      toastMessage: 'Message personnalisé pour le toast',
      isCritical: true
    });
  }
}
```

## 4. Mise en cache avec le nouveau système

Le hook `useNotionCachedAPI` combine le nouveau système de mode opérationnel avec la mise en cache :

```typescript
import { useNotionCachedAPI } from '@/hooks/useNotionCachedAPI';

function MyComponent() {
  const {
    data,
    isLoading,
    error,
    isStale,
    refresh,
    silentRefresh
  } = useNotionCachedAPI(
    'my-cache-key',
    () => fetch('/api/data').then(res => res.json()),
    {
      demoData: { /* données simulées */ },
      ttl: 5 * 60 * 1000, // 5 minutes
      staleTime: 60 * 1000, // 1 minute
      revalidateOnMount: true
    }
  );
  
  return (
    <div>
      {isStale && <button onClick={refresh}>Actualiser</button>}
      {/* Afficher les données */}
    </div>
  );
}
```

## 5. Configuration du système operationMode

Le nouveau système peut être configuré globalement :

```typescript
import { operationMode } from '@/services/operationMode';

// Configurer les paramètres par défaut
operationMode.updateSettings({
  failureThreshold: 3, // Nombre d'erreurs consécutives avant basculement automatique
  errorSimulationRate: 10, // Taux de simulation d'erreur en mode démo (%)
  simulatedNetworkDelay: 500, // Délai réseau simulé en mode démo (ms)
  autoFallbackEnabled: true // Activer le fallback automatique en cas d'erreurs consécutives
});

// Réinitialiser le système
operationMode.reset();
```

## Conclusion

En migrant vers le nouveau système `operationMode`, vous bénéficiez de :
- Une API plus simple et cohérente
- Une gestion d'erreurs plus robuste
- Une intégration avec le système de cache
- Une meilleure séparation des préoccupations
- Des fonctionnalités de diagnostic et de débogage avancées
