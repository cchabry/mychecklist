
# Architecture du système de proxy API

## Vue d'ensemble

L'architecture du proxy API a été conçue pour être modulaire, extensible et adaptable à différents environnements de déploiement. Elle permet de contourner les limitations CORS lors des appels à l'API Notion tout en offrant une expérience développeur cohérente, quel que soit l'environnement d'exécution.

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
└── README.md                 # Documentation utilisateur
```

## Principes de conception

1. **Abstraction** : L'interface `ProxyAdapter` définit un contrat commun pour tous les adaptateurs, permettant l'interchangeabilité.

2. **Détection automatique** : Le système détecte automatiquement l'environnement d'exécution et choisit l'adaptateur le plus approprié.

3. **Gestion des erreurs unifiée** : Toutes les erreurs sont formatées de manière cohérente, facilitant leur traitement par les couches supérieures.

4. **Extensibilité** : Ajouter le support pour une nouvelle plateforme ne nécessite que la création d'un nouvel adaptateur.

5. **Configuration minimale** : Le système fonctionne avec une configuration minimale, tout en offrant des options de personnalisation avancées.

## Flux de données

1. L'application initialise le `ProxyManager` au démarrage.
2. Le `ProxyManager` détecte l'environnement et initialise l'adaptateur approprié.
3. Les requêtes API sont envoyées via le `ProxyManager` qui les délègue à l'adaptateur actif.
4. L'adaptateur transforme la requête selon les spécificités de la plateforme.
5. La réponse est standardisée avant d'être retournée à l'application.

## Diagramme de séquence

```
Application -> ProxyManager: request(method, endpoint, data)
ProxyManager -> EnvironmentDetector: detect()
EnvironmentDetector --> ProxyManager: environment
ProxyManager -> Adapter: select(environment)
ProxyManager -> Adapter: request(method, endpoint, data)
Adapter -> API: HTTP Request
API --> Adapter: HTTP Response
Adapter --> ProxyManager: standardized response
ProxyManager --> Application: ApiResponse<T>
```

## Gestion des erreurs

Le système catégorise les erreurs en plusieurs types :

- **Erreurs de configuration** : Configuration manquante ou invalide.
- **Erreurs réseau** : Problèmes de connectivité, timeouts.
- **Erreurs d'API** : Réponses d'erreur de l'API (401, 403, etc.).
- **Erreurs internes** : Exceptions imprévues dans le code.

Chaque erreur inclut :
- Un message convivial pour l'utilisateur
- Des détails techniques pour le débogage
- Un code d'erreur pour la gestion programmatique
- Des suggestions de résolution quand c'est possible

## Mode de démonstration

Le système supporte un "mode démonstration" qui permet de fonctionner sans accès à l'API réelle, en utilisant des données simulées. Ce mode est particulièrement utile pour :

- Le développement hors ligne
- Les tests automatisés
- Les démonstrations client
- Les situations où l'API réelle est indisponible

## Extensibilité

Pour ajouter le support d'une nouvelle plateforme :

1. Créer une nouvelle classe d'adaptateur étendant `AbstractProxyAdapter`
2. Implémenter les méthodes requises (`initialize`, `isAvailable`, `request`)
3. Ajouter l'adaptateur au tableau `availableAdapters` dans `index.ts`
4. Mettre à jour `environmentDetector.ts` pour reconnaître le nouvel environnement

## Sécurité

Le système intègre plusieurs mécanismes de sécurité :

- **Validation des entrées** : Toutes les entrées utilisateur sont validées.
- **Protection contre les attaques CSRF** : Tokens d'état pour les flux OAuth.
- **Stockage chiffré** : Les tokens sensibles sont chiffrés avant stockage local.
- **Durée de vie limitée** : Les tokens temporaires expirent après une courte période.
