
# Guide de migration depuis mockMode vers operationMode

Ce document décrit les étapes nécessaires pour migrer du système `mockMode` vers le nouveau système `operationMode` plus robuste.

## Pourquoi migrer?

Le système `mockMode` présentait plusieurs limitations:
- Architecture trop couplée avec le reste de l'application
- Absence de mécanismes de détection automatique des problèmes de connectivité
- Interface utilisateur limitée
- Difficulté à maintenir et à étendre

Le nouveau système `operationMode` résout ces problèmes avec:
- Une architecture modulaire et découplée
- Une détection automatique des erreurs réseau
- Une interface utilisateur améliorée et plus intuitive
- Une meilleure gestion des modes de fonctionnement

## Changements principaux

### 1. Renommage des constantes et méthodes

| Ancien (mockMode) | Nouveau (operationMode) |
|-------------------|-------------------------|
| `mockMode.isActive()` | `operationMode.isDemoMode` |
| `mockMode.activate()` | `operationMode.enableDemoMode()` |
| `mockMode.deactivate()` | `operationMode.enableRealMode()` |
| `mockMode.toggle()` | `operationMode.toggle()` |

### 2. Mise à jour des imports

```diff
- import { mockMode } from '@/lib/notionProxy/mockMode';
+ import { operationMode } from '@/services/operationMode';
```

### 3. Utilisation dans les conditions

```diff
- if (mockMode.isActive()) {
+ if (operationMode.isDemoMode) {
  // Code pour le mode démo
}
```

### 4. Remplacer les hooks

```diff
- import { useMockMode } from '@/hooks/notion/useMockMode';
+ import { useOperationMode } from '@/services/operationMode';

function MonComposant() {
-  const { isMockMode, toggleMockMode } = useMockMode();
+  const { isDemoMode, toggle, enableRealMode, enableDemoMode } = useOperationMode();

   return (
     <div>
-      <p>Mode mock actif: {isMockMode ? 'Oui' : 'Non'}</p>
-      <button onClick={toggleMockMode}>Changer</button>
+      <p>Mode démo actif: {isDemoMode ? 'Oui' : 'Non'}</p>
+      <button onClick={toggle}>Changer</button>
     </div>
   );
}
```

### 5. Remplacer les composants UI

```diff
- import MockModeControl from '@/components/notion/MockModeControl';
+ import OperationModeControl from '@/components/OperationModeControl';

function App() {
  return (
    <div>
-     <MockModeControl />
+     <OperationModeControl />
    </div>
  );
}
```

## Fonctionnalités additionnelles

Le nouveau système `operationMode` offre des fonctionnalités supplémentaires:

### Notification automatique des erreurs

```javascript
import { operationMode } from '@/services/operationMode';

try {
  // Opération qui peut échouer
} catch (error) {
  // Notifier le système de l'erreur
  operationMode.handleConnectionError(error, 'Contexte de l\'opération');
}

// Notifier le système d'une opération réussie
operationMode.handleSuccessfulOperation();
```

### Hook de gestion des erreurs simplifié

```javascript
import { useNotionAutoFallback } from '@/hooks/useNotionAutoFallback';

function MonComposant() {
  const {
    isDemoMode,
    reportNotionError,
    reportNotionSuccess,
    attemptRealMode
  } = useNotionAutoFallback();
  
  const fetchData = async () => {
    try {
      const result = await fetch('/api/data');
      reportNotionSuccess();
      return result.json();
    } catch (error) {
      reportNotionError(error, 'Chargement des données');
      return null;
    }
  };
  
  return (
    <div>
      {isDemoMode && (
        <button onClick={attemptRealMode}>Tenter en mode réel</button>
      )}
    </div>
  );
}
```

## Aide et support

Pour toute question sur cette migration, contactez l'équipe de développement.
