
# Guide de configuration des bases de données Notion pour l'application d'audit

Ce document contient toutes les instructions nécessaires pour créer et configurer les bases de données Notion requises pour le fonctionnement de l'application d'audit.

## Prérequis

- Un compte Notion
- Des droits d'administration sur un espace de travail Notion
- Une clé d'API Notion (voir section "Création d'une intégration Notion")

## Création d'une intégration Notion

1. Rendez-vous sur la [page des intégrations Notion](https://www.notion.so/my-integrations)
2. Cliquez sur "Nouvelle intégration"
3. Donnez un nom à votre intégration (ex: "Application d'audit qualité")
4. Sélectionnez l'espace de travail auquel vous souhaitez associer l'intégration
5. Configurez les capacités de l'intégration:
   - Cochez "Lire le contenu"
   - Cochez "Mettre à jour le contenu"
   - Cochez "Insérer du contenu"
6. Cliquez sur "Soumettre" pour créer l'intégration
7. Copiez la clé d'API secrète qui s'affiche (elle commence par `secret_`)

## Structure des bases de données

L'application nécessite deux bases de données principales:
1. **Base de données Projets**: Stocke les informations sur les sites web à auditer
2. **Base de données Checklists**: Contient les critères d'évaluation et bonnes pratiques

### 1. Création de la base de données Projets

1. Dans Notion, créez une nouvelle page
2. Tapez `/database` puis sélectionnez "Table - Database"
3. Nommez cette base de données "Projets d'audit"
4. Configurez les propriétés suivantes:

| Nom de la propriété | Type         | Description                                   |
|---------------------|--------------|-----------------------------------------------|
| Name                | Title        | Nom du projet (propriété par défaut)          |
| URL                 | URL          | URL du site web à auditer                     |
| Description         | Text         | Description du projet                         |
| Status              | Select       | Statut du projet (voir options ci-dessous)    |
| Progress            | Number       | Pourcentage d'avancement (0-100)              |
| Created             | Created time | Date de création (automatique)                |
| Updated             | Last edited  | Date de dernière modification (automatique)   |
| Pages               | Number       | Nombre de pages dans l'échantillon            |

Options pour la propriété "Status":
- À faire
- En cours
- Terminé
- Archivé

5. Partagez la base de données avec votre intégration:
   - Cliquez sur "•••" en haut à droite de la base de données
   - Sélectionnez "Ajouter des connexions"
   - Recherchez et sélectionnez le nom de votre intégration
   - Cliquez sur "Confirmer"

6. Copiez l'ID de la base de données Projets:
   - Ouvrez la base de données en plein écran
   - Dans l'URL, copiez la partie après le dernier "/" et avant le "?"
   - Exemple: dans `https://www.notion.so/workspace/83d9d3a270ff4b0a95856a96db5a7e35?v=...`, l'ID est `83d9d3a270ff4b0a95856a96db5a7e35`

### 2. Création de la base de données Checklists

1. Dans Notion, créez une nouvelle page
2. Tapez `/database` puis sélectionnez "Table - Database"
3. Nommez cette base de données "Checklist de bonnes pratiques"
4. Configurez les propriétés suivantes:

| Nom de la propriété | Type         | Description                                       |
|---------------------|--------------|---------------------------------------------------|
| Name                | Title        | Titre de l'item (propriété par défaut)            |
| Description         | Text         | Description détaillée de l'item                   |
| Category            | Select       | Catégorie principale (voir options ci-dessous)    |
| Subcategory         | Select       | Sous-catégorie                                    |
| Reference           | Multi-select | Références à des règles dans des référentiels officiels |
| Profile             | Multi-select | Type d'intervenant concerné                       |
| Phase               | Multi-select | Étape du projet concernée                         |
| Effort              | Select       | Complexité de mise en œuvre                       |
| Priority            | Select       | Priorité/importance de la consigne                |

Options pour la propriété "Category":
- Accessibilité
- Performance
- Ergonomie
- Technique
- Contenu
- Médias
- Sécurité

Options pour la propriété "Effort":
- Faible
- Moyen
- Important
- Critique

Options pour la propriété "Priority":
- Faible
- Moyenne
- Haute
- Critique

5. Partagez la base de données avec votre intégration:
   - Cliquez sur "•••" en haut à droite de la base de données
   - Sélectionnez "Ajouter des connexions"
   - Recherchez et sélectionnez le nom de votre intégration
   - Cliquez sur "Confirmer"

6. Copiez l'ID de la base de données Checklists:
   - Ouvrez la base de données en plein écran
   - Dans l'URL, copiez la partie après le dernier "/" et avant le "?"
   - Exemple: dans `https://www.notion.so/workspace/94f8d3a270ff4b0a95856a96db5a7e35?v=...`, l'ID est `94f8d3a270ff4b0a95856a96db5a7e35`

## Configuration de l'application

1. Lancez l'application d'audit
2. Cliquez sur "Configurer Notion" ou accédez aux paramètres
3. Saisissez votre clé d'API Notion dans le champ "Clé API"
4. Saisissez l'ID de la base de données Projets dans le champ "ID de la base de données des projets"
5. Saisissez l'ID de la base de données Checklists dans le champ "ID de la base de données des checklists"
6. Cliquez sur "Tester la connexion" pour vérifier que tout fonctionne correctement
7. Sauvegardez la configuration
