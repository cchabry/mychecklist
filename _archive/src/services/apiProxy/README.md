
# Système de Proxy API Modulaire

Ce système permet d'effectuer des requêtes API vers Notion (ou d'autres services) en contournant les limitations CORS et en s'adaptant automatiquement à l'environnement de déploiement.

## Structure du système

```
apiProxy/
├── index.ts                  # Point d'entrée principal et exports
├── types.ts                  # Types et interfaces
├── AbstractProxyAdapter.ts   # Classe abstraite pour les adaptateurs
├── ProxyManager.ts           # Gestionnaire central des adaptateurs
├── environmentDetector.ts    # Détection de l'environnement
├── adapters/                 # Adaptateurs spécifiques aux plateformes
│   ├── NetlifyProxyAdapter.ts  # Adaptateur pour Netlify
│   ├── LocalProxyAdapter.ts    # Adaptateur pour environnement local
│   └── ...                     # Autres adaptateurs
└── README.md                 # Cette documentation
```

## Comment ajouter un nouvel adaptateur

Pour ajouter un support pour une nouvelle plateforme d'hébergement, suivez ces étapes :

### 1. Créer une nouvelle classe d'adaptateur

Créez un nouveau fichier dans le dossier `adapters/`, par exemple `VercelProxyAdapter.ts` :

```typescript
import { 
  DeploymentEnvironment, 
  HttpMethod, 
  RequestOptions, 
  ApiResponse 
} from '../types';
import { AbstractProxyAdapter } from '../AbstractProxyAdapter';

export class VercelProxyAdapter extends AbstractProxyAdapter {
  constructor() {
    super('VercelProxyAdapter', DeploymentEnvironment.Vercel);
  }
  
  async initialize(config: any): Promise<boolean> {
    await super.initialize(config);
    // Configuration spécifique à Vercel
    return true;
  }
  
  async isAvailable(): Promise<boolean> {
    // Logique pour détecter si on est sur Vercel
    return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
  }
  
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    // Logique d'appel API spécifique à Vercel
    // ... implémentation ...
  }
}
```

### 2. Mettre à jour les exports dans index.ts

Modifiez le fichier `index.ts` pour inclure le nouvel adaptateur :

```typescript
// Exporter le nouvel adaptateur
import { VercelProxyAdapter } from './adapters/VercelProxyAdapter';
export const vercelAdapter = new VercelProxyAdapter();

// Mettre à jour le tableau des adaptateurs disponibles
export const availableAdapters = [
  netlifyAdapter,
  localAdapter,
  vercelAdapter
];
```

### 3. Implémenter les fonctions serverless/API routes si nécessaire

Pour Vercel, créez un fichier dans `/api/notion-proxy.ts` :

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Logique de proxy similaire à la fonction Netlify
  // ...
}
```

### 4. Mettre à jour le détecteur d'environnement

Assurez-vous que votre nouvel environnement est correctement détecté :

```typescript
// Dans environmentDetector.ts
function detectBrowserEnvironment(): DeploymentEnvironment {
  const hostname = window.location.hostname;
  
  // Ajouter la détection du nouvel environnement
  if (hostname.includes('vercel.app')) {
    return DeploymentEnvironment.Vercel;
  }
  
  // ... autres détections ...
}
```

### 5. Tester l'intégration

Déployez votre application sur la nouvelle plateforme et vérifiez que :
- L'environnement est correctement détecté
- L'adaptateur approprié est activé
- Les requêtes API fonctionnent correctement

## Bonnes pratiques

1. **Isolation des dépendances** : Chaque adaptateur doit être indépendant des autres.
2. **Détection fiable** : L'adaptateur doit pouvoir détecter de manière fiable s'il peut fonctionner dans l'environnement actuel.
3. **Gestion d'erreur cohérente** : Utilisez les méthodes `createProxyError` et `createErrorResponse` de la classe de base.
4. **Logs détaillés** : Utilisez la méthode `log` pour journaliser les informations importantes.
5. **Configuration extensible** : Permettez une configuration flexible via la méthode `initialize`.

## Exemples d'adaptateurs

- `NetlifyProxyAdapter`: Utilise les fonctions Netlify
- `LocalProxyAdapter`: Appels directs en mode développement
- `VercelProxyAdapter`: Utilise les API routes de Vercel/Next.js

## Débogage

Pour déboguer un adaptateur spécifique, vous pouvez activer le mode debug :

```typescript
import { initializeApiProxy } from '@/services/apiProxy';

await initializeApiProxy({ debug: true });
```
