
# Audit Web

Application d'audit d'accessibilité pour sites web.

## Architecture

Le projet suit une architecture modulaire telle que décrite dans [ARCHITECTURE.md](ARCHITECTURE.md).

## Structure

- `/src/types` - Définitions de types TypeScript
  - `/domain` - Types du domaine métier
  - `/api` - Types pour les services API
  - `/notion` - Types pour l'intégration Notion

- `/src/services` - Services et logique métier
  - `/api` - Services d'accès aux données
  - `/notion` - Services d'intégration avec Notion
  - `/cache` - Système de cache
  - `/operationMode` - Gestion du mode d'opération (réel/démo)

- `/src/components` - Composants React réutilisables
  - `/ui` - Composants d'interface utilisateur génériques
  - `/notion` - Composants spécifiques à l'intégration Notion
  - `/audit` - Composants liés aux audits
  - `/project` - Composants liés aux projets

- `/src/hooks` - Hooks React personnalisés

- `/src/pages` - Pages de l'application

- `/_archive` - Code de référence (ancienne version)

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
```
