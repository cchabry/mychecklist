
# Exemples de migration vers le système operationMode

Ce document contient des exemples concrets pour vous aider à migrer de l'ancien système `mockMode` vers le nouveau système `operationMode`.

## Exemple 1: Composant d'affichage du statut

### Avant (avec mockMode)

```jsx
import React, { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';

const StatusIndicator = () => {
  const [isMock, setIsMock] = useState(notionApi.mockMode.isActive());
  
  useEffect(() => {
    const unsubscribe = notionApi.mockMode.subscribe((isActive) => {
      setIsMock(isActive);
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <div className="status-indicator">
      <span className={`status-dot ${isMock ? 'status-demo' : 'status-real'}`} />
      <span>Mode {isMock ? 'démonstration' : 'réel'}</span>
    </div>
  );
};
```

### Après (avec operationMode)

```jsx
import React from 'react';
import { useOperationMode } from '@/services/operationMode';

const StatusIndicator = () => {
  const { isDemoMode, mode } = useOperationMode();
  
  return (
    <div className="status-indicator">
      <span className={`status-dot ${isDemoMode ? 'status-demo' : 'status-real'}`} />
      <span>Mode {mode}</span>
    </div>
  );
};
```

## Exemple 2: Appel API avec gestion des erreurs

### Avant (avec mockMode)

```jsx
import React, { useState } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

const DataFetcher = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (notionApi.mockMode.isActive()) {
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 500));
        result = { mockData: 'Ceci est une donnée de démonstration' };
      } else {
        // Appel API réel
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        result = await response.json();
      }
      
      setData(result);
      toast.success('Données chargées avec succès');
    } catch (err) {
      setError(err.message);
      toast.error('Erreur: ' + err.message);
      
      // Activer le mode mock en cas d'erreur
      if (!notionApi.mockMode.isActive()) {
        notionApi.mockMode.activate();
        toast.info('Mode démonstration activé suite à une erreur');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Chargement...' : 'Charger les données'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};
```

### Après (avec useNotionAPI)

```jsx
import React, { useState } from 'react';
import { useNotionAPI } from '@/hooks/useNotionAPI';

const DataFetcher = () => {
  const { executeOperation, isLoading, error, isDemoMode } = useNotionAPI();
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
      const result = await executeOperation(
        // Fonction pour l'API réelle
        () => fetch('/api/data').then(res => {
          if (!res.ok) throw new Error('Erreur lors de la récupération des données');
          return res.json();
        }),
        {
          // Données de démonstration
          demoData: { mockData: 'Ceci est une donnée de démonstration' },
          
          // Options de configuration
          showLoadingToast: true,
          showErrorToast: true,
          
          // Messages personnalisés
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
  
  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Charger les données'}
      </button>
      
      {error && <div className="error">{error.message}</div>}
      
      {isDemoMode && <div className="demo-mode-badge">Mode démo</div>}
      
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};
```

## Exemple 3: Mise en cache avec useNotionCachedAPI

### Avant (logique personnalisée)

```jsx
import React, { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';

const CachedDataComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fonction pour charger les données
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      // Vérifier le cache
      const cachedData = localStorage.getItem('cached_data');
      const cacheTimestamp = localStorage.getItem('cached_data_timestamp');
      
      // Vérifier si le cache est valide (moins de 5 minutes)
      const isCacheValid = cachedData && cacheTimestamp && 
                          (Date.now() - parseInt(cacheTimestamp, 10)) < 5 * 60 * 1000;
      
      if (isCacheValid) {
        // Utiliser les données du cache
        setData(JSON.parse(cachedData));
        setLoading(false);
        
        // Recharger en arrière-plan si le cache a plus d'une minute
        if ((Date.now() - parseInt(cacheTimestamp, 10)) > 60 * 1000) {
          loadFreshData(true);
        }
        return;
      }
      
      // Charger de nouvelles données
      await loadFreshData(false);
    } catch (err) {
      if (!silent) {
        setError(err.message);
        setLoading(false);
      }
    }
  };
  
  // Fonction pour charger des données fraîches
  const loadFreshData = async (silent) => {
    try {
      let result;
      
      if (notionApi.mockMode.isActive()) {
        // Données mock
        await new Promise(resolve => setTimeout(resolve, 500));
        result = { mockData: 'Données mises en cache', timestamp: Date.now() };
      } else {
        // Appel API réel
        const response = await fetch('/api/cached-data');
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        result = await response.json();
      }
      
      // Mettre en cache
      localStorage.setItem('cached_data', JSON.stringify(result));
      localStorage.setItem('cached_data_timestamp', Date.now().toString());
      
      // Mettre à jour l'état si ce n'est pas un rechargement silencieux
      if (!silent) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (!silent) {
        setError(err.message);
        setLoading(false);
      }
      
      // Activer le mode mock en cas d'erreur
      if (!notionApi.mockMode.isActive()) {
        notionApi.mockMode.activate();
      }
    }
  };
  
  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);
  
  return (
    <div>
      {loading && <div>Chargement...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {data && (
        <div>
          <h3>Données</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <button onClick={() => loadData()}>Actualiser</button>
        </div>
      )}
    </div>
  );
};
```

### Après (avec useNotionCachedAPI)

```jsx
import React from 'react';
import { useNotionCachedAPI } from '@/hooks/useNotionCachedAPI';

const CachedDataComponent = () => {
  const {
    data,
    isLoading,
    error,
    isStale,
    refresh,
    silentRefresh
  } = useNotionCachedAPI(
    'cached-data', // Clé de cache
    // Fonction pour l'API réelle
    () => fetch('/api/cached-data').then(res => {
      if (!res.ok) throw new Error('Erreur lors du chargement des données');
      return res.json();
    }),
    {
      // Données de démonstration
      demoData: { mockData: 'Données mises en cache', timestamp: Date.now() },
      
      // Options de cache
      ttl: 5 * 60 * 1000, // 5 minutes
      staleTime: 60 * 1000, // 1 minute
      revalidateOnMount: true,
      
      // Options de notification
      showLoadingToast: false,
      messages: {
        error: 'Erreur lors du chargement des données en cache'
      }
    }
  );
  
  return (
    <div>
      {isLoading && <div>Chargement...</div>}
      
      {error && <div className="error">{error.message}</div>}
      
      {data && (
        <div>
          <h3>Données {isStale && <span>(périmées)</span>}</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          
          <div className="actions">
            {isStale ? (
              <button onClick={refresh}>Actualiser</button>
            ) : (
              <button onClick={silentRefresh}>Rafraîchir en arrière-plan</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```
