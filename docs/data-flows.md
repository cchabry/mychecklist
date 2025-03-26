
# Documentation des flux de données

Ce document décrit les principaux flux de données dans l'application d'audit d'accessibilité.

## Flux de récupération de projets

```mermaid
sequenceDiagram
    participant UI as Interface Utilisateur
    participant Hook as useProjects
    participant Feature as ProjectFeature
    participant Service as NotionService
    participant Client as NotionClient
    participant API as Notion API

    UI->>Hook: Initialisation du composant
    Hook->>Feature: getProjects()
    Feature->>Service: notionService.getProjects()
    Service->>Client: Vérifier mode opérationnel
    
    alt Mode démonstration
        Client->>Service: Retourner données mockées
    else Mode réel
        Client->>API: Requête HTTP
        API->>Client: Réponse API
        Client->>Service: Données brutes Notion
        Service->>Feature: Conversion en modèle Project
    end
    
    Service->>Feature: Response<Project[]>
    Feature->>Hook: Project[] ou Error
    Hook->>UI: { projects, isLoading, error }
```

## Flux de gestion des erreurs

```mermaid
flowchart TB
    A[Appel API] --> B{Succès?}
    B -->|Oui| C[Renvoyer données]
    B -->|Non| D[Créer AppError]
    D --> E[Hook useErrorHandler]
    E --> F{Options de traitement}
    F -->|showToast=true| G[Afficher Toast]
    F -->|logToConsole=true| H[Logger en console]
    F -->|onError callback| I[Exécuter callback]
    G --> J[UI: Notification utilisateur]
    E --> K[UI: Afficher erreur]
```

## Architecture des services Notion

```mermaid
classDiagram
    class NotionClient {
        +get(url)
        +post(url, data)
        +patch(url, data)
        +delete(url)
        +isMockMode()
    }
    
    class NotionBaseService {
        +handleResponse()
        +convertToModel()
    }
    
    class NotionService {
        +getProjects()
        +getProjectById()
        +createProject()
        +updateProject()
        +deleteProject()
    }
    
    class ProjectService {
        +getProjects()
        +getProjectById()
        +createProject()
        +updateProject()
        +deleteProject()
    }
    
    class AuditService {
        +getAudits()
        +getAuditById()
        +createAudit()
        +updateAudit()
        +deleteAudit()
    }
    
    NotionService --> NotionClient: utilise
    NotionBaseService --> NotionClient: utilise
    ProjectService --|> NotionBaseService: hérite
    AuditService --|> NotionBaseService: hérite
    NotionService --> ProjectService: délègue
    NotionService --> AuditService: délègue
```

## Modèle de données

```mermaid
erDiagram
    PROJECT ||--o{ AUDIT : contains
    PROJECT ||--o{ SAMPLE_PAGE : includes
    PROJECT ||--o{ EXIGENCE : defines
    CHECKLIST_ITEM ||--o{ EXIGENCE : referenced_by
    AUDIT ||--o{ EVALUATION : contains
    SAMPLE_PAGE ||--o{ EVALUATION : evaluated_in
    EXIGENCE ||--o{ EVALUATION : assessed_by
    EVALUATION ||--o{ CORRECTIVE_ACTION : requires
    CORRECTIVE_ACTION ||--o{ ACTION_PROGRESS : tracked_by
    
    PROJECT {
        string id
        string name
        string url
        string description
        string createdAt
        string updatedAt
        number progress
    }
    
    CHECKLIST_ITEM {
        string id
        string title
        string description
        string category
        string subcategory
        string[] reference
        string[] profile
        string[] phase
        string effort
        string priority
    }
    
    EXIGENCE {
        string id
        string projectId
        string itemId
        enum importance
        string comment
    }
    
    SAMPLE_PAGE {
        string id
        string projectId
        string url
        string title
        string description
        number order
    }
    
    AUDIT {
        string id
        string projectId
        string name
        string description
        string createdAt
        string updatedAt
        number progress
    }
    
    EVALUATION {
        string id
        string auditId
        string pageId
        string exigenceId
        enum score
        string comment
        string[] attachments
        string createdAt
        string updatedAt
    }
    
    CORRECTIVE_ACTION {
        string id
        string evaluationId
        enum targetScore
        enum priority
        string dueDate
        string responsible
        string comment
        enum status
    }
    
    ACTION_PROGRESS {
        string id
        string actionId
        string date
        string responsible
        string comment
        enum score
        enum status
    }
```
