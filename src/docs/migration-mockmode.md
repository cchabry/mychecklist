
# Guide de migration de mockMode vers operationMode

Ce document détaille les modifications apportées lors de la migration du système mockMode vers le nouveau système operationMode, plus robuste et extensible.

## Changements principaux

### 1. Remplacement des imports

**Avant:**
```typescript
import mockMode from '@/lib/notionProxy/mockMode';
import { mockUtils } from '@/lib/notionProxy/mock';
```

**Après:**
```typescript
import { operationMode, operationModeUtils } from '@/services/operationMode';
```

### 2. Vérification du mode actif

**Avant:**
```typescript
if (mockMode.isActive()) {
  // Mode démo
} else {
  // Mode réel
}
```

**Après:**
```typescript
if (operationMode.isDemoMode) {
  // Mode démo
} else {
  // Mode réel
}
```

### 3. Changement de mode

**Avant:**
```typescript
mockMode.activate(); // Activer le mode mock
mockMode.deactivate(); // Désactiver le mode mock
mockMode.toggle(); // Basculer le mode
```

**Après:**
```typescript
operationMode.enableDemoMode(); // Activer le mode démonstration
operationMode.enableRealMode(); // Activer le mode réel
operationMode.toggle(); // Basculer le mode
```

### 4. Utilitaires de simulation

**Avant:**
```typescript
await mockUtils.applyDelay();
if (mockUtils.shouldSimulateError()) {
  throw new Error("Erreur simulée");
}
```

**Après:**
```typescript
await operationModeUtils.applySimulatedDelay();
if (operationModeUtils.shouldSimulateError()) {
  operationModeUtils.simulateConnectionError();
}
```

### 5. Composants UI

**Avant:**
```tsx
import MockModeToggle from '@/components/MockModeToggle';
<MockModeToggle />
```

**Après:**
```tsx
import OperationModeStatus from '@/components/OperationModeStatus';
// ou
import OperationModeControl from '@/components/OperationModeControl';

// Version simple avec toggle
<OperationModeStatus showToggle={true} />

// Version complète avec paramètres
<OperationModeControl />
```

### 6. Hook React

**Avant:**
```tsx
import { useMockMode } from '@/hooks/useMockMode';

function MyComponent() {
  const { isActive, toggle } = useMockMode();
  
  return (
    <div>
      <p>Mode actuel: {isActive ? 'Démo' : 'Réel'}</p>
      <button onClick={toggle}>Changer</button>
    </div>
  );
}
```

**Après:**
```tsx
import { useOperationMode } from '@/services/operationMode';

function MyComponent() {
  const { isDemoMode, toggle } = useOperationMode();
  
  return (
    <div>
      <p>Mode actuel: {isDemoMode ? 'Démo' : 'Réel'}</p>
      <button onClick={toggle}>Changer</button>
    </div>
  );
}
```

## Avantages du nouveau système

1. **Meilleure gestion des erreurs**
   - Détection automatique des problèmes de connectivité
   - Basculement automatique configurable
   - Compteur d'échecs consécutifs

2. **Paramètres configurables**
   - Taux d'erreurs simulées
   - Délai réseau simulé
   - Seuil de basculement automatique

3. **Interface utilisateur améliorée**
   - Contrôles plus intuitifs
   - Indication claire du mode actif et de la raison
   - Notifications de changement de mode

4. **Intégration avec le système de cache**
   - TTL adaptatif selon le mode
   - Stratégies de mise en cache configurable

## Les adaptateurs de compatibilité temporaires

Pendant la transition, nous avons créé plusieurs adaptateurs temporaires :

1. `src/lib/operationMode/index.ts` (supprimé)
   - Réexportait les éléments depuis le nouveau chemin
   - Permettait une migration progressive

2. `src/lib/notionProxy/mockMode.ts` (supprimé)
   - Adaptateur qui redirige les appels vers operationMode
   - Préservait la compatibilité avec le code existant

3. `src/components/MockModeToggle.tsx` (remplacé)
   - Transformé en wrapper autour de OperationModeStatus
   - Maintenant directement remplacé par OperationModeStatus

## Utilisation dans les endpoints API

Pour les points de terminaison API qui utilisaient mockMode pour simuler des réponses :

**Avant:**
```typescript
// Dans un endpoint API
if (mockMode.isActive()) {
  // Simuler un délai
  await mockUtils.applyDelay();
  // Renvoyer des données mock
  return mockData.getFakeData();
}
// Sinon, appeler l'API réelle
```

**Après:**
```typescript
// Dans un endpoint API
if (operationMode.isDemoMode) {
  // Simuler un délai
  await operationModeUtils.applySimulatedDelay();
  // Simuler une erreur aléatoire selon configuration
  if (operationModeUtils.shouldSimulateError()) {
    operationModeUtils.simulateConnectionError();
  }
  // Renvoyer des données mock
  return mockData.getFakeData();
}
// Sinon, appeler l'API réelle
```

## Transition des hooks personnalisés

Plusieurs hooks personnalisés liés au mode de démonstration ont été migrés ou consolidés :

1. `useMockMode` -> `useOperationMode`
   - Accès complet à toutes les fonctionnalités du mode opérationnel

2. Nouveau hook : `useOperationModeListener`
   - Version simplifiée pour les composants qui n'ont besoin que de l'état

## Gestion automatique des erreurs

Le nouveau système intègre une gestion automatique des erreurs :

```typescript
try {
  // Opération qui peut échouer
} catch (error) {
  // Signaler l'erreur au système de mode opérationnel
  operationMode.handleConnectionError(
    error instanceof Error ? error : new Error(String(error)),
    'Contexte de l'erreur'
  );
}
```

## Migration complète

La migration a été complétée en plusieurs étapes :

1. Implémentation du nouveau système operationMode
2. Création d'adaptateurs temporaires pour assurer la compatibilité
3. Migration progressive de tous les composants et services
4. Suppression des adaptateurs temporaires et fichiers obsolètes
5. Vérification finale et nettoyage du code

## Fichiers supprimés

Les fichiers suivants ont été supprimés car ils ne servaient plus :

- `src/lib/notionProxy/mockMode.ts`
- `src/lib/notionProxy/mock/mode.ts`
- `src/lib/notionProxy/mock/state.ts`
- `src/lib/notionProxy/mock/utils.ts`
- `src/lib/operationMode/index.ts`

## Recommandations pour les développements futurs

1. **Utiliser directement les imports de operationMode**
   ```typescript
   import { operationMode, operationModeUtils } from '@/services/operationMode';
   ```

2. **Exploiter les mécanismes de détection d'erreurs**
   ```typescript
   operationMode.handleConnectionError(error, 'Contexte');
   operationMode.handleSuccessfulOperation();
   ```

3. **Utiliser les hooks appropriés**
   - `useOperationMode` pour un accès complet
   - `useOperationModeListener` pour un accès simplifié
