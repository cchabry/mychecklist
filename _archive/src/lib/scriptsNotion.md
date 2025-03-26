
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

## Script d'initialisation des bases de données

Voici un script Node.js qui vous permettra de créer automatiquement les bases de données Notion et d'y ajouter quelques exemples:

```javascript
const { Client } = require('@notionhq/client');

// Remplacez par votre clé d'API Notion
const NOTION_API_KEY = 'secret_votre_cle_api';

// Initialisation du client Notion
const notion = new Client({
  auth: NOTION_API_KEY,
});

async function createProjectsDatabase() {
  try {
    const response = await notion.databases.create({
      parent: {
        type: "page_id",
        // Remplacez par l'ID d'une page existante où vous voulez créer la base de données
        page_id: "votre_page_id",
      },
      title: [
        {
          type: "text",
          text: {
            content: "Projets d'audit",
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        URL: {
          url: {},
        },
        Description: {
          rich_text: {},
        },
        Status: {
          select: {
            options: [
              { name: "À faire", color: "blue" },
              { name: "En cours", color: "yellow" },
              { name: "Terminé", color: "green" },
              { name: "Archivé", color: "gray" },
            ],
          },
        },
        Progress: {
          number: {
            format: "percent",
          },
        },
        Created: {
          created_time: {},
        },
        Updated: {
          last_edited_time: {},
        },
        Pages: {
          number: {
            format: "number",
          },
        },
      },
    });

    console.log("Base de données Projets créée avec succès!");
    console.log(`ID de la base de données: ${response.id}`);
    return response.id;
  } catch (error) {
    console.error("Erreur lors de la création de la base de données Projets:", error);
    return null;
  }
}

async function createChecklistsDatabase() {
  try {
    const response = await notion.databases.create({
      parent: {
        type: "page_id",
        // Remplacez par l'ID d'une page existante où vous voulez créer la base de données
        page_id: "votre_page_id",
      },
      title: [
        {
          type: "text",
          text: {
            content: "Checklist de bonnes pratiques",
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        Description: {
          rich_text: {},
        },
        Category: {
          select: {
            options: [
              { name: "Accessibilité", color: "blue" },
              { name: "Performance", color: "green" },
              { name: "Ergonomie", color: "yellow" },
              { name: "Technique", color: "orange" },
              { name: "Contenu", color: "purple" },
              { name: "Médias", color: "pink" },
              { name: "Sécurité", color: "red" },
            ],
          },
        },
        Subcategory: {
          select: {
            options: [
              { name: "Images", color: "blue" },
              { name: "Vidéos", color: "blue" },
              { name: "Formulaires", color: "yellow" },
              { name: "Navigation", color: "yellow" },
              { name: "Architecture", color: "orange" },
              { name: "Contenu éditorial", color: "purple" },
              { name: "Sécurité des données", color: "red" },
            ],
          },
        },
        Reference: {
          multi_select: {
            options: [
              { name: "RGAA", color: "blue" },
              { name: "RGESN", color: "green" },
              { name: "WCAG", color: "yellow" },
              { name: "OPQUAST", color: "orange" },
            ],
          },
        },
        Profile: {
          multi_select: {
            options: [
              { name: "Product Owner", color: "red" },
              { name: "UX Designer", color: "pink" },
              { name: "UI Designer", color: "purple" },
              { name: "Développeur", color: "blue" },
              { name: "Contributeur", color: "yellow" },
            ],
          },
        },
        Phase: {
          multi_select: {
            options: [
              { name: "Cadrage", color: "blue" },
              { name: "Conception", color: "green" },
              { name: "Développement", color: "yellow" },
              { name: "Tests", color: "orange" },
              { name: "Production", color: "red" },
            ],
          },
        },
        Effort: {
          select: {
            options: [
              { name: "Faible", color: "green" },
              { name: "Moyen", color: "yellow" },
              { name: "Important", color: "orange" },
              { name: "Critique", color: "red" },
            ],
          },
        },
        Priority: {
          select: {
            options: [
              { name: "Faible", color: "green" },
              { name: "Moyenne", color: "yellow" },
              { name: "Haute", color: "orange" },
              { name: "Critique", color: "red" },
            ],
          },
        },
      },
    });

    console.log("Base de données Checklists créée avec succès!");
    console.log(`ID de la base de données: ${response.id}`);
    return response.id;
  } catch (error) {
    console.error("Erreur lors de la création de la base de données Checklists:", error);
    return null;
  }
}

async function addSampleProjects(databaseId) {
  try {
    // Projet 1
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Site vitrine entreprise",
              },
            },
          ],
        },
        URL: {
          url: "https://exemple-entreprise.com",
        },
        Description: {
          rich_text: [
            {
              text: {
                content: "Audit du site vitrine de l'entreprise Exemple",
              },
            },
          ],
        },
        Status: {
          select: {
            name: "En cours",
          },
        },
        Progress: {
          number: 25,
        },
        Pages: {
          number: 5,
        },
      },
    });

    // Projet 2
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "E-commerce produits bio",
              },
            },
          ],
        },
        URL: {
          url: "https://bio-ecoshop.com",
        },
        Description: {
          rich_text: [
            {
              text: {
                content: "Audit complet de la boutique en ligne de produits biologiques",
              },
            },
          ],
        },
        Status: {
          select: {
            name: "À faire",
          },
        },
        Progress: {
          number: 0,
        },
        Pages: {
          number: 8,
        },
      },
    });

    console.log("Exemples de projets ajoutés avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'ajout des exemples de projets:", error);
  }
}

async function addSampleChecklists(databaseId) {
  try {
    // Item 1
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Images avec attribut alt",
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: "Toutes les images doivent avoir un attribut alt pertinent décrivant leur contenu.",
              },
            },
          ],
        },
        Category: {
          select: {
            name: "Accessibilité",
          },
        },
        Subcategory: {
          select: {
            name: "Images",
          },
        },
        Reference: {
          multi_select: [
            { name: "RGAA" },
            { name: "WCAG" },
          ],
        },
        Profile: {
          multi_select: [
            { name: "Développeur" },
            { name: "Contributeur" },
          ],
        },
        Phase: {
          multi_select: [
            { name: "Développement" },
            { name: "Production" },
          ],
        },
        Effort: {
          select: {
            name: "Faible",
          },
        },
        Priority: {
          select: {
            name: "Haute",
          },
        },
      },
    });

    // Item 2
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Contraste de couleurs suffisant",
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: "Le contraste entre le texte et l'arrière-plan doit être d'au moins 4,5:1 pour le texte normal et 3:1 pour le grand texte.",
              },
            },
          ],
        },
        Category: {
          select: {
            name: "Accessibilité",
          },
        },
        Subcategory: {
          select: {
            name: "Contenu éditorial",
          },
        },
        Reference: {
          multi_select: [
            { name: "RGAA" },
            { name: "WCAG" },
          ],
        },
        Profile: {
          multi_select: [
            { name: "UI Designer" },
            { name: "Développeur" },
          ],
        },
        Phase: {
          multi_select: [
            { name: "Conception" },
            { name: "Développement" },
          ],
        },
        Effort: {
          select: {
            name: "Moyen",
          },
        },
        Priority: {
          select: {
            name: "Haute",
          },
        },
      },
    });

    // Item 3
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Optimisation des images",
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: "Les images doivent être optimisées pour le web avec un bon équilibre entre qualité et taille de fichier.",
              },
            },
          ],
        },
        Category: {
          select: {
            name: "Performance",
          },
        },
        Subcategory: {
          select: {
            name: "Images",
          },
        },
        Reference: {
          multi_select: [
            { name: "RGESN" },
            { name: "OPQUAST" },
          ],
        },
        Profile: {
          multi_select: [
            { name: "Développeur" },
            { name: "UI Designer" },
          ],
        },
        Phase: {
          multi_select: [
            { name: "Développement" },
          ],
        },
        Effort: {
          select: {
            name: "Moyen",
          },
        },
        Priority: {
          select: {
            name: "Moyenne",
          },
        },
      },
    });

    console.log("Exemples d'items de checklist ajoutés avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'ajout des exemples d'items de checklist:", error);
  }
}

async function main() {
  // Création des bases de données
  const projectsDbId = await createProjectsDatabase();
  const checklistsDbId = await createChecklistsDatabase();

  if (projectsDbId) {
    // Ajout d'exemples de projets
    await addSampleProjects(projectsDbId);
  }

  if (checklistsDbId) {
    // Ajout d'exemples d'items de checklist
    await addSampleChecklists(checklistsDbId);
  }

  console.log("\nRécapitulatif des IDs à configurer dans l'application:");
  console.log("--------------------------------------------------");
  console.log(`Base de données Projets: ${projectsDbId || 'Erreur lors de la création'}`);
  console.log(`Base de données Checklists: ${checklistsDbId || 'Erreur lors de la création'}`);
  console.log("--------------------------------------------------");
  console.log("Copiez ces IDs dans la configuration de l'application.");
}

main();
```

Pour utiliser ce script:

1. Créez un nouveau fichier nommé `setupNotion.js`
2. Copiez-collez le code ci-dessus dans ce fichier
3. Modifiez la valeur de `NOTION_API_KEY` avec votre clé d'API
4. Modifiez la valeur de `page_id` dans les fonctions `createProjectsDatabase` et `createChecklistsDatabase` avec l'ID d'une page existante dans votre espace de travail Notion
5. Installez les dépendances requises: `npm install @notionhq/client`
6. Exécutez le script: `node setupNotion.js`

## Bases de données supplémentaires

Pour une fonctionnalité complète, les bases de données suivantes pourraient être nécessaires dans une version future:

1. **Base de données Pages d'échantillon**: Pour stocker les pages à auditer pour chaque projet
2. **Base de données Exigences**: Pour stocker les exigences spécifiques à chaque projet
3. **Base de données Audits**: Pour stocker les informations générales sur chaque audit
4. **Base de données Évaluations**: Pour stocker les résultats d'évaluation
5. **Base de données Actions correctives**: Pour stocker les actions à réaliser

Ces bases de données pourront être ajoutées ultérieurement lorsque les fonctionnalités correspondantes seront implémentées dans l'application.

## Résolution des problèmes courants

### Erreur "Missing integration"
- Vérifiez que vous avez bien partagé la base de données avec votre intégration
- Assurez-vous d'utiliser la bonne clé d'API dans la configuration de l'application

### Erreur "Object not found"
- Vérifiez que les IDs de base de données sont corrects
- Assurez-vous que les bases de données existent toujours et n'ont pas été supprimées

### Erreur "Failed to fetch"
- Vérifiez votre connexion internet
- Assurez-vous que le proxy Notion est correctement configuré dans l'application

## Ressources supplémentaires

- [Documentation de l'API Notion](https://developers.notion.com/reference/intro)
- [Guide des intégrations Notion](https://developers.notion.com/docs)
- [Exemples de code pour l'API Notion](https://github.com/makenotion/notion-sdk-js/tree/main/examples)
