
# Documentation technique

Bienvenue dans la documentation technique de l'application d'audit d'accessibilité.

## Table des matières

- [Architecture de référence](../ARCHITECTURE.md)
- [Flux de données](./data-flows.md)
- [Guide de développement](./dev-guide.md)
- [Checklist pour la vérification des types](./typescript-type-review-checklist.md)

## Organisation du code

L'application suit une architecture modulaire avec séparation des responsabilités:

- **Components**: Composants UI réutilisables
- **Features**: Fonctionnalités métier organisées par domaine
- **Hooks**: Hooks React personnalisés pour la gestion d'état
- **Services**: Services d'accès aux données et logique métier
- **Types**: Définitions de types TypeScript
- **Utils**: Fonctions utilitaires

## Principes de développement

- **Simplicité**: Concevoir des solutions simples plutôt que complexes
- **Séparation des responsabilités**: Chaque module a un rôle spécifique
- **Typage fort**: Utiliser TypeScript pour garantir la sécurité du code
- **Tests**: Couvrir les fonctionnalités critiques par des tests
- **Documentation**: Maintenir une documentation à jour et complète

## Contribution au projet

Consultez le [guide de développement](./dev-guide.md) pour les conventions de code et les workflows de contribution.

## Diagrammes

Les [flux de données](./data-flows.md) principaux sont documentés avec des diagrammes Mermaid pour faciliter la compréhension.
