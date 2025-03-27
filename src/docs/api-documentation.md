
# Documentation des APIs

## Structure générale des APIs

Notre application utilise une architecture en couches pour interagir avec les données stockées dans Notion:

1. **Hooks React Query** - Points d'entrée pour les composants React
2. **Feature APIs** - Fonctions de haut niveau exposées par chaque module fonctionnel
3. **API Notion** - Interface unifiée pour tous les domaines (projets, audits, etc.)
4. **Services spécifiques par domaine** - Implémentation des opérations spécifiques
5. **Client Notion** - Communication de bas niveau avec l'API Notion

## Conventions d'usage des APIs

### Utilisation des hooks React Query

Les hooks React Query sont la méthode privilégiée pour accéder aux données dans les composants React:

```tsx
// Exemple d'utilisation d'un hook pour récupérer les données d'un projet
const { data: project, isLoading, error } = useProjectById('project-123');

if (isLoading) return <Loader />;
if (error) return <ErrorDisplay error={error} />;

return <ProjectDetails project={project} />;
```

### Utilisation directe des fonctions API

Pour les cas où React Query n'est pas adapté, les fonctions API peuvent être appelées directement:

```tsx
// Exemple d'appel direct à l'API
try {
  const project = await getProjectById('project-123');
  // Traitement des données
} catch (error) {
  // Gestion des erreurs
}
```

## Gestion des erreurs

Toutes les APIs suivent un modèle uniforme de gestion des erreurs:

1. Les hooks React Query exposent directement les erreurs via la propriété `error`
2. Les fonctions API de feature génèrent des erreurs avec des messages explicites
3. Les erreurs de l'API Notion sont structurées avec `message`, `code` et `details`

## Modèle de données principal

### Projets
- `Project` - Site web à auditer
  - Propriétés: id, name, url, description, createdAt, updatedAt, progress

### Checklist
- `ChecklistItem` - Item du référentiel de bonnes pratiques
  - Propriétés: id, consigne, description, category, subcategory, reference, profil, phase, effort, priority

### Exigences
- `Exigence` - Personnalisation d'un item de checklist pour un projet
  - Propriétés: id, projectId, itemId, importance, comment

### Pages d'échantillon
- `SamplePage` - Page spécifique d'un site à auditer
  - Propriétés: id, projectId, url, title, description, order

### Audits
- `Audit` - Session d'évaluation d'un projet
  - Propriétés: id, projectId, name, description, createdAt, updatedAt, progress

### Évaluations
- `Evaluation` - Résultat d'évaluation d'une page par rapport à une exigence
  - Propriétés: id, auditId, pageId, exigenceId, score, comment, attachments, createdAt, updatedAt

### Actions correctives
- `CorrectiveAction` - Action à effectuer suite à une évaluation
  - Propriétés: id, evaluationId, targetScore, priority, dueDate, responsible, comment, status

### Suivi des progrès
- `ActionProgress` - Suivi des progrès d'une action corrective
  - Propriétés: id, actionId, date, responsible, comment, score, status
