
# Documentation du système operationMode

Le système operationMode permet de gérer facilement le basculement entre le mode réel (utilisant l'API Notion) et le mode démonstration (utilisant des données simulées). Ce document explique comment utiliser ce système dans l'application.

## Concepts de base

### Les modes disponibles

- **Mode réel**: L'application se connecte à l'API Notion pour récupérer et enregistrer des données.
- **Mode démonstration**: L'application utilise des données simulées et peut simuler des délais réseau et des erreurs.

### Avantages du système

- Facilite le développement et les tests sans connexion API
- Permet aux utilisateurs de continuer à travailler en cas de problème de connectivité
- Fournit une expérience de démonstration stable et contrôlée
- Détecte automatiquement les problèmes d'API et bascule en mode démonstration

## Utilisation dans le code

### Service principal

```typescript
import { operationMode, OperationMode } from '@/services/operationMode';

// Vérifier le mode actuel
if (operationMode.isDemoMode) {
  console.log("Mode démonstration actif");
}

// Activer le mode démonstration
operationMode.enableDemoMode("Activation manuelle");

// Activer le mode réel
operationMode.enableRealMode();

// Basculer entre les modes
operationMode.toggle();

// S'abonner aux changements de mode
const unsubscribe = operationMode.subscribe((mode, reason) => {
  console.log(`Mode changé: ${mode}, Raison: ${reason || 'Non spécifiée'}`);
});

// Configurer les paramètres
operationMode.updateSettings({
  autoSwitchOnFailure: true,
  maxConsecutiveFailures: 3,
  errorSimulationRate: 10, // 10% d'erreurs en mode démo
  simulatedNetworkDelay: 300 // 300ms de délai simulé
});

// Gérer les erreurs de connexion
try {
  await fetchData();
} catch (error) {
  operationMode.handleConnectionError(error, "Récupération des données");
}

// Signaler une opération réussie (réinitialise le compteur d'échecs)
operationMode.handleSuccessfulOperation();
```

### Hook React

```typescript
import { useOperationMode } from '@/services/operationMode';

function MyComponent() {
  const {
    isDemoMode,
    isRealMode,
    mode,
    switchReason,
    failures,
    settings,
    toggle,
    enableDemoMode,
    enableRealMode,
    updateSettings
  } = useOperationMode();
  
  return (
    <div>
      <p>Mode actuel: {isDemoMode ? 'Démonstration' : 'Réel'}</p>
      <p>Raison: {switchReason || 'Non spécifiée'}</p>
      <p>Échecs consécutifs: {failures}</p>
      <button onClick={toggle}>Basculer</button>
      <button onClick={() => updateSettings({ simulatedNetworkDelay: 500 })}>
        Augmenter délai
      </button>
    </div>
  );
}
```

### Utilitaires de simulation

```typescript
import { operationModeUtils } from '@/services/operationMode';

async function fetchWithSimulation() {
  // Appliquer un délai simulé
  await operationModeUtils.applySimulatedDelay();
  
  // Vérifier s'il faut simuler une erreur
  if (operationModeUtils.shouldSimulateError()) {
    operationModeUtils.simulateConnectionError();
  }
  
  // Alternative: utiliser l'utilitaire tout-en-un
  return await operationModeUtils.simulateOperation(
    () => fetch('/api/data'),
    "Récupération des données"
  );
}
```

### Composants UI prêts à l'emploi

```tsx
import OperationModeStatus from '@/components/OperationModeStatus';
import OperationModeControl from '@/components/OperationModeControl';

function AppHeader() {
  return (
    <header>
      <h1>Mon Application</h1>
      {/* Version simple: juste un indicateur */}
      <OperationModeStatus />
    </header>
  );
}

function SettingsPage() {
  return (
    <div>
      <h2>Paramètres</h2>
      {/* Version complète: contrôle complet avec paramètres */}
      <OperationModeControl 
        showFailures={true}
        showSettings={true}
      />
    </div>
  );
}
```

## Intégration avec d'autres systèmes

### Système de cache

Le système de cache s'intègre automatiquement avec operationMode:

- En mode démonstration, le cache est toujours utilisé pour minimiser les simulations redondantes
- Les TTL sont adaptés en fonction du mode (plus longs en mode démonstration)
- L'invalidation du cache est gérée différemment selon le mode

### Gestion des erreurs

Le système de gestion d'erreurs interagit avec operationMode:

- Les erreurs de connexion sont signalées à operationMode via handleConnectionError
- Le compteur d'échecs consécutifs peut déclencher un basculement automatique
- Des notifications informent l'utilisateur des problèmes et des changements de mode

### Services API

Les services API devraient vérifier le mode actuel et adapter leur comportement:

```typescript
async function fetchProjects() {
  if (operationMode.isDemoMode) {
    return mockData.projects;
  } else {
    return await api.get('/projects');
  }
}
```

## Meilleures pratiques

1. **Utilisez useOperationMode** dans les composants React plutôt que d'importer directement le service
2. **Signalez toujours les erreurs** avec handleConnectionError pour permettre le basculement automatique
3. **Signalez les opérations réussies** avec handleSuccessfulOperation pour réinitialiser le compteur d'échecs
4. **Utilisez les composants prêts à l'emploi** plutôt que de créer votre propre UI pour le mode
5. **Intégrez avec le système de cache** pour une expérience optimale en mode démonstration
