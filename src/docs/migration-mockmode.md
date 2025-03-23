
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

## Fichiers supprimés

Les fichiers suivants ont été supprimés car ils ne servaient que d'adaptateurs de compatibilité:

- `src/lib/notionProxy/mockMode.ts`
- `src/lib/notionProxy/mock/mode.ts`
- `src/lib/notionProxy/mock/state.ts`
- `src/lib/operationMode/index.ts`

## Fichiers modifiés

- `src/lib/notionProxy/mock/utils.ts` - Simplifié pour appeler directement operationModeUtils
- `src/lib/notionProxy/mock/index.ts` - Suppression des références aux fichiers supprimés
- `src/components/MockModeToggle.tsx` - Transformé en wrapper autour de OperationModeStatus

## Prochaines étapes

- Supprimer complètement le dossier `src/lib/notionProxy/mock/` une fois que tous les imports auront été mis à jour
- Remplacer directement tous les usages de MockModeToggle par OperationModeStatus
