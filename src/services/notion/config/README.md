
# Configuration de l'intégration Notion

Ce document décrit comment configurer l'intégration Notion dans différents environnements.

## Variables d'environnement

L'application prend en charge les variables d'environnement suivantes pour configurer l'intégration Notion:

### Variables principales

| Variable | Description | Requis | Format |
|----------|-------------|--------|--------|
| `NOTION_API_KEY` | Clé API d'intégration Notion | Oui | `secret_...` ou `ntn_...` |
| `NOTION_DB_PROJECTS` | ID de la base de données des projets | Oui | ID ou URL Notion |
| `NOTION_DB_CHECKLISTS` | ID de la base de données des checklists | Non | ID ou URL Notion |
| `NOTION_DB_EXIGENCES` | ID de la base de données des exigences | Non | ID ou URL Notion |
| `NOTION_DB_AUDITS` | ID de la base de données des audits | Non | ID ou URL Notion |
| `NOTION_DB_EVALUATIONS` | ID de la base de données des évaluations | Non | ID ou URL Notion |
| `NOTION_MOCK_MODE` | Active le mode démonstration | Non | `true` ou `false` |
| `NOTION_DEBUG` | Active le mode débogage | Non | `true` ou `false` |

### Préfixes spécifiques aux plateformes

L'application détecte automatiquement l'environnement et cherche les variables avec les préfixes appropriés:

- **Netlify**: `NETLIFY_NOTION_API_KEY`, `NETLIFY_NOTION_DB_PROJECTS`, etc.
- **Vercel**: `NEXT_PUBLIC_NOTION_API_KEY`, `NEXT_PUBLIC_NOTION_DB_PROJECTS`, etc.
- **Développement local (Vite)**: `VITE_NOTION_API_KEY`, `VITE_NOTION_DB_PROJECTS`, etc.

## Configuration par plateforme

### Netlify

Dans l'interface Netlify, allez dans "Site settings" > "Build & deploy" > "Environment" et ajoutez les variables suivantes:

```
NETLIFY_NOTION_API_KEY=secret_votre_clé_api
NETLIFY_NOTION_DB_PROJECTS=id_de_votre_base_de_données
```

### Vercel

Dans l'interface Vercel, allez dans "Settings" > "Environment Variables" et ajoutez les variables suivantes:

```
NEXT_PUBLIC_NOTION_API_KEY=secret_votre_clé_api
NEXT_PUBLIC_NOTION_DB_PROJECTS=id_de_votre_base_de_données
```

### Développement local

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:

```
VITE_NOTION_API_KEY=secret_votre_clé_api
VITE_NOTION_DB_PROJECTS=id_de_votre_base_de_données
```

## Notes importantes

- **Sécurité**: Les clés API sont stockées côté client dans localStorage. Bien que ce ne soit pas idéal du point de vue de la sécurité, c'est une approche courante pour les applications frontend qui interagissent directement avec des API comme Notion. Pour une sécurité accrue, envisagez d'utiliser un proxy backend.

- **Priorité**: Si une configuration existe à la fois dans les variables d'environnement et dans localStorage, la valeur de localStorage est utilisée par défaut, sauf si on force le rechargement depuis l'environnement.

- **Fallback automatique**: Si l'API Notion n'est pas accessible, l'application bascule automatiquement en mode démonstration. Vous pouvez désactiver ce comportement en définissant le paramètre `autoFallback` à `false`.
