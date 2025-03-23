
# Guide de migration de mockMode vers operationMode

Ce guide explique comment migrer votre code du système `mockMode` obsolète vers le nouveau système `operationMode` plus robuste.

## Pourquoi migrer?

Le système `operationMode` offre plusieurs avantages:

- Architecture plus robuste et découplée
- Détection automatique des problèmes de connectivité  
- Meilleure gestion des erreurs et notifications
- API plus claire et cohérente
- Gestion intelligente des modes de fonctionnement

## Modifications nécessaires

### 1. Imports

```diff
- import { mockMode } from '@/lib/notionProxy/mockMode';
- import { notionApi } from '@/lib/notionProxy';
+ import { operationMode } from '@/services/operationMode';
```

### 2. Vérifications de mode

```diff
- if (mockMode.isActive()) {
+ if (operationMode.isDemoMode) {
  // Code pour le mode démo
}

- const isMockActive = mockMode.isActive();
+ const isDemoMode = operationMode.isDemoMode;
```

### 3. Changement de mode

```diff
// Activer le mode démo
- mockMode.activate();
+ operationMode.enableDemoMode('Raison du changement');

// Désactiver le mode démo (activer le mode réel)
- mockMode.deactivate();
+ operationMode.enableRealMode();

// Basculer le mode
- const isNowMock = mockMode.toggle();
+ operationMode.toggle();
+ const isDemoNow = operationMode.isDemoMode;
```

### 4. Dans les composants React 

```diff
- import { useMockMode } from '@/hooks/notion/useMockMode';
+ import { useOperationMode } from '@/services/operationMode';

function MonComposant() {
-  const { isMockMode, toggleMockMode } = useMockMode();
+  const { isDemoMode, toggle } = useOperationMode();

  return (
    <div>
-     <p>Mode mock actif: {isMockMode ? 'Oui' : 'Non'}</p>
-     <button onClick={toggleMockMode}>Changer</button>
+     <p>Mode démo actif: {isDemoMode ? 'Oui' : 'Non'}</p>
+     <button onClick={toggle}>Changer</button>
    </div>
  );
}
```

### 5. Composants UI

```diff
- import MockModeControl from '@/components/notion/MockModeControl';
- import MockModeToggle from '@/components/MockModeToggle';
+ import OperationModeControl from '@/components/OperationModeControl';

function App() {
  return (
    <div>
-     <MockModeControl />
+     <OperationModeControl />
      
      {/* Pour une version simplifiée */}
-     <MockModeToggle />
+     <OperationModeControl simplified />
    </div>
  );
}
```

### 6. Gestion des erreurs

Le nouveau système offre une meilleure gestion des erreurs:

```typescript
// Signaler une erreur de connexion
operationMode.handleConnectionError(error, 'Contexte de l\'erreur');

// Signaler une opération réussie
operationMode.handleSuccessfulOperation();
```

## Mode de compatibilité temporaire

Un module de compatibilité (`mockMode.ts`) est temporairement maintenu pour faciliter la transition, mais il sera supprimé dans une future version. Ce module redirige toutes les méthodes obsolètes vers leurs équivalents modernes.

**Ces appels afficheront des avertissements dans la console et des notifications toast pour vous rappeler de migrer votre code.**

## Hooks de compatibilité

Les hooks suivants sont dépréciés et afficheront des avertissements:

- `useMockMode` → utiliser `useOperationMode` à la place
- `useOperationModeListener` → utiliser `useOperationMode` à la place

## Support

Pour toute question sur cette migration, contactez l'équipe de développement.
