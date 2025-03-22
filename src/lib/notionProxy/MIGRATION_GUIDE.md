
# Guide de Migration : Du MockMode vers OperationMode

Ce guide explique comment migrer votre code du système `mockMode` vers le nouveau système `operationMode`, qui offre une meilleure gestion des modes de fonctionnement de l'application.

## Pourquoi migrer ?

Le nouveau système `operationMode` offre de nombreux avantages :

- Détection automatique des erreurs de connexion
- Basculement intelligent entre modes réel et démo
- Meilleure gestion des erreurs et des notifications
- API plus claire et plus intuitive
- Performances améliorées
- Meilleure expérience utilisateur

## Guide de migration étape par étape

### 1. Importation

**Avant :**
```typescript
import { notionApi } from '@/lib/notionProxy';
// Utilisation : notionApi.mockMode.isActive()
```

**Après :**
```typescript
import { operationMode } from '@/services/operationMode';
// Utilisation : operationMode.isDemoMode()
```

### 2. Vérification du mode actif

**Avant :**
```typescript
const isMockActive = notionApi.mockMode.isActive();
if (isMockActive) {
  // Code pour le mode mock
}
```

**Après :**
```typescript
const isDemoMode = operationMode.isDemoMode();
if (isDemoMode) {
  // Code pour le mode démo
}
```

### 3. Changement de mode

**Avant :**
```typescript
// Activer le mode mock
notionApi.mockMode.activate();

// Désactiver le mode mock
notionApi.mockMode.deactivate();

// Basculer le mode
const isNowMock = notionApi.mockMode.toggle();
```

**Après :**
```typescript
// Activer le mode démo
operationMode.enableDemoMode('Raison du changement');

// Activer le mode réel
operationMode.enableRealMode();

// Basculer le mode
const newMode = operationMode.toggle();
```

### 4. Dans les composants React

**Avant :**
```typescript
import React, { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';

const MyComponent = () => {
  const [isMockMode, setIsMockMode] = useState(notionApi.mockMode.isActive());
  
  useEffect(() => {
    const checkMockMode = () => {
      setIsMockMode(notionApi.mockMode.isActive());
    };
    
    const interval = setInterval(checkMockMode, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // ...
};
```

**Après :**
```typescript
import React from 'react';
import { useOperationMode } from '@/services/operationMode';

const MyComponent = () => {
  const { isDemoMode, enableRealMode, enableDemoMode } = useOperationMode();
  
  // useOperationMode s'occupe de mettre à jour l'état automatiquement
  // Plus besoin d'interval !
  
  // ...
};
```

### 5. Pour les requêtes API

**Avant :**
```typescript
import { useNotionRequest } from '@/hooks/useNotionRequest';

const MyComponent = () => {
  const { executeRequest } = useNotionRequest();
  
  const fetchData = async () => {
    const result = await executeRequest(
      () => notionApi.databases.query(databaseId),
      {
        mockResponse: mockData,
        successMessage: 'Données chargées'
      }
    );
    // ...
  };
};
```

**Après :**
```typescript
import { useNotionFallbackAPI } from '@/hooks/useNotionFallbackAPI';

const MyComponent = () => {
  const { executeRequest } = useNotionFallbackAPI();
  
  const fetchData = async () => {
    const result = await executeRequest(
      () => notionApi.databases.query(databaseId),
      {
        demoData: () => mockData,
        successMessage: 'Données chargées'
      }
    );
    // ...
  };
};
```

### 6. Composant d'interface

**Avant :**
```jsx
import MockModeToggle from '@/components/MockModeToggle';
// ou
import MockModeControl from '@/components/notion/MockModeControl';

// Dans le JSX
<MockModeToggle onToggle={handleToggle} />
<MockModeControl />
```

**Après :**
```jsx
import OperationModeControl from '@/components/OperationModeControl';

// Dans le JSX
<OperationModeControl onToggle={handleToggle} />
// ou, pour une version simplifiée
<OperationModeControl simplified />
```

## Gestion des erreurs

Le nouveau système offre une meilleure gestion des erreurs :

```typescript
// Notifier le système d'une erreur de connexion
operationMode.handleConnectionError(error, 'Contexte de l'erreur');

// Notifier le système d'une opération réussie
operationMode.handleSuccessfulOperation();
```

## Fonctionnalités avancées

Le nouveau système offre également :

- Paramètres configurables via `operationMode.updateSettings()`
- Abonnement aux changements via `operationMode.subscribe()`
- Accès à l'historique des erreurs via `operationMode.getLastError()`
- Compteur d'échecs consécutifs via `operationMode.getConsecutiveFailures()`

## Support de compatibilité

Pour faciliter la migration, l'ancien système `mockMode` continuera à fonctionner pendant une période transitoire, en redirigeant les appels vers le nouveau système. Cependant, ces fonctions sont marquées comme dépréciées et des avertissements apparaîtront dans la console.

## Aide et support

Pour toute question sur la migration, contactez l'équipe de développement.
