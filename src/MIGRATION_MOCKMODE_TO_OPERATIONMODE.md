
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
+ import { operationMode, useOperationMode } from '@/services/operationMode';
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

### 4. Fonctions utilitaires avancées

```diff
// Forcer temporairement le mode réel
- const wasMock = mockMode.temporarilyForceReal();
+ const wasMock = operationModeUtils.temporarilyForceReal();

// Restaurer après un forçage temporaire
- mockMode.restoreAfterForceReal(wasMock);
+ operationModeUtils.restoreAfterForceReal(wasMock);

// Vérifier si on est en mode forcé
- const isForcedReal = mockMode.isTemporarilyForcedReal(wasMock);
+ const isForcedReal = operationModeUtils.isTemporarilyForcedReal(wasMock);

// Simuler un délai réseau
- await mockMode.applySimulatedDelay(1000);
+ await operationModeUtils.applySimulatedDelay(1000);

// Simuler une erreur
- if (mockMode.shouldSimulateError(10)) {
+ if (operationModeUtils.shouldSimulateError(10)) {
  throw new Error("Erreur simulée");
}
```

### 5. Dans les composants React 

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

### 6. Composants UI

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

### 7. Gestion des erreurs

Le nouveau système offre une meilleure gestion des erreurs:

```typescript
// Signaler une erreur de connexion
operationMode.handleConnectionError(error, 'Contexte de l\'erreur');

// Signaler une opération réussie
operationMode.handleSuccessfulOperation();

// Avec le hook
const { handleConnectionError, handleSuccessfulOperation } = useOperationMode();

// Ou avec un hook utilitaire
const { reportNotionError, reportNotionSuccess } = useNotionAutoFallback();
```

## Mode de compatibilité temporaire

Un module de compatibilité (`mockMode.ts`) est temporairement maintenu pour faciliter la transition, mais il sera supprimé dans une future version. Ce module redirige toutes les méthodes obsolètes vers leurs équivalents modernes.

**Ces appels afficheront des avertissements dans la console et des notifications toast pour vous rappeler de migrer votre code.**

## Support

Pour toute question sur cette migration, contactez l'équipe de développement.
