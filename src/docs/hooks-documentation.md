
# Documentation des Hooks

## Principes généraux

Les hooks React sont le principal moyen d'accéder aux données et aux fonctionnalités dans notre application. Ils suivent une structure cohérente pour faciliter leur utilisation et leur compréhension.

### Catégories de hooks

Notre application utilise plusieurs types de hooks:

1. **Hooks de récupération de données** - Basés sur React Query, ils récupèrent et mettent en cache les données
2. **Hooks de mutation** - Pour créer, mettre à jour ou supprimer des données
3. **Hooks d'état** - Pour gérer l'état local et la logique métier
4. **Hooks utilitaires** - Pour des fonctionnalités communes comme la gestion des erreurs ou des formulaires

## Hooks de récupération de données

### Conventions de nommage

Les hooks de récupération suivent une convention de nommage cohérente:

- `use{Entity}` - Pour récupérer une liste d'entités (ex: `useProjects`)
- `use{Entity}ById` - Pour récupérer une entité par son ID (ex: `useProjectById`)
- `use{Entity}By{Property}` - Pour récupérer des entités filtrées (ex: `useAuditsByProjectId`)

### Structure commune

Tous les hooks de récupération retournent un objet avec cette structure:

```tsx
{
  data: T | null | undefined;  // Les données récupérées
  isLoading: boolean;          // Indicateur de chargement
  error: Error | null;         // Erreur éventuelle
  // ... autres propriétés spécifiques à React Query
}
```

### Exemple d'utilisation

```tsx
const { data: projects, isLoading, error } = useProjects();

// Afficher un indicateur de chargement
if (isLoading) return <Loader />;

// Gérer les erreurs
if (error) return <ErrorDisplay error={error} />;

// Afficher les données
return (
  <div>
    <h1>Projets</h1>
    <ul>
      {projects?.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  </div>
);
```

## Hooks de mutation

### Conventions de nommage

Les hooks de mutation suivent une convention de nommage cohérente:

- `useCreate{Entity}` - Pour créer une nouvelle entité (ex: `useCreateProject`)
- `useUpdate{Entity}` - Pour mettre à jour une entité (ex: `useUpdateProject`)
- `useDelete{Entity}` - Pour supprimer une entité (ex: `useDeleteProject`)

### Structure commune

Tous les hooks de mutation retournent un objet avec cette structure:

```tsx
{
  mutate: (data: InputType) => Promise<ResultType>;  // Fonction pour déclencher la mutation
  isLoading: boolean;                               // Indicateur de chargement
  error: Error | null;                              // Erreur éventuelle
  // ... autres propriétés spécifiques à React Query
}
```

### Exemple d'utilisation

```tsx
const { mutate: createProject, isLoading } = useCreateProject();

const handleSubmit = async (formData) => {
  try {
    const newProject = await createProject(formData);
    toast.success('Projet créé avec succès');
    navigate(`/projects/${newProject.id}`);
  } catch (error) {
    toast.error(`Erreur lors de la création du projet: ${error.message}`);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Champs du formulaire */}
    <button type="submit" disabled={isLoading}>
      {isLoading ? 'Création en cours...' : 'Créer le projet'}
    </button>
  </form>
);
```

## Hooks d'état

Ces hooks gèrent la logique métier et l'état local dans les composants:

- `useLoadingState` - Gestion de l'état de chargement et des erreurs
- `useForm` - Gestion des formulaires avec validation
- `useSort` - Gestion du tri des listes
- `useFilter` - Gestion des filtres

### Exemple d'utilisation

```tsx
const { isLoading, error, startLoading, stopLoading, setErrorMessage } = useLoadingState();

const handleAction = async () => {
  startLoading();
  try {
    await performAction();
    stopLoading();
  } catch (err) {
    setErrorMessage(`Une erreur est survenue: ${err.message}`);
  }
};
```

## Hooks utilitaires

Ces hooks fournissent des fonctionnalités communes:

- `useErrorHandler` - Gestion standardisée des erreurs
- `useToast` - Affichage de notifications
- `useCache` - Manipulation du cache
- `useOperationMode` - Gestion du mode d'opération (réel ou démo)

### Exemple d'utilisation

```tsx
const { handleError } = useErrorHandler();
const { success, error } = useToast();

const performAction = async () => {
  try {
    const result = await someAsyncAction();
    success('Action réalisée avec succès');
    return result;
  } catch (err) {
    handleError(err, { showToast: true, toastTitle: 'Erreur' });
  }
};
```
