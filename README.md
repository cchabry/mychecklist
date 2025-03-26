# Audit Checklist Application

Cette application permet de réaliser des audits de sites web en vérifiant leur conformité par rapport à une checklist de bonnes pratiques. Chaque projet possède son propre échantillon de pages et ses propres exigences.

## Fonctionnalités

- Gestion de projets d'audit
- Référentiel de bonnes pratiques (checklist)
- Configuration d'exigences spécifiques par projet
- Réalisation d'audits avec évaluation par page
- Suivi d'actions correctives

## Structure du projet

Le projet suit l'architecture définie dans le document ARCHITECTURE.md :

```
/src
  /components        # Composants UI réutilisables
    /ui              # Composants de base (shadcn/ui)
    /forms           # Composants de formulaires spécifiques
    /layout          # Composants de mise en page
  
  /features          # Fonctionnalités principales organisées par domaine
    /projects        # Gestion des projets
    /audits          # Gestion des audits
    /checklists      # Gestion des checklists et exigences
  
  /hooks             # Hooks React personnalisés
    /api             # Hooks d'accès aux données
  
  /services          # Services et logique métier
    /api             # Client API (Notion)
    /operationMode   # Système de mode opérationnel
  
  /types             # Définitions de types TypeScript
    /api             # Types pour les réponses/requêtes API
    /domain          # Types du domaine métier
  
  /utils             # Utilitaires et fonctions helpers
  
  /pages             # Pages de l'application
```

## Avancement du projet (Sprint 1)

Nous avons terminé la mise en place des fondations du projet et commencé le développement des fonctionnalités principales. La structure du projet est établie selon l'architecture définie, avec une séparation claire des responsabilités.

État d'avancement:
- ✅ Initialisation du projet et configuration de l'environnement
- ✅ Mise en place du système de routage
- ✅ Implémentation du design system de base (shadcn/ui)
- ✅ Structure de base pour les types de domaine
- 🔄 Développement du client API (en cours)
- 🔄 Implémentation des interfaces de gestion de projets (en cours)

<!-- Version de build actuelle: 2023-11-09 -->
