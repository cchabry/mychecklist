
# Pattern standardisé pour les hooks de mutation

Ce document définit le pattern standardisé à utiliser pour implémenter les hooks de mutation (création, mise à jour, suppression) dans l'application.

## Structure commune

Tous les hooks de mutation doivent suivre cette structure:

```typescript
export function useActionOnEntity(params) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      // Logique de transformation des données (facultatif)
      return await actionOnEntity(entityId, transformedData);
    },
    onSuccess: (data, variables) => {
      // Invalidation du cache
      queryClient.invalidateQueries({ queryKey: ['entité', entityId] });
      
      // Affichage du message de succès
      handleMutationSuccess('Entité', 'action');
      
      // Retourner les données pour permettre le chaînage
      return data;
    },
    onError: (error) => {
      // Gestion des erreurs
      handleMutationError(error, 'entité', 'action');
    }
  });
}
```

## Utilitaires partagés

Les hooks utilisent les utilitaires partagés du module `@/utils/query-helpers` pour standardiser la gestion des succès et des erreurs:

- `handleMutationSuccess`: Affiche un toast de succès avec des messages standardisés
- `handleMutationError`: Gère les erreurs (log, toast) de manière uniforme

## Conventions d'implémentation

### Hook de création (useCreate{Entity})

```typescript
export function useCreateEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEntityData) => {
      return await createEntity(data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      handleMutationSuccess('Entity', 'create');
      return data;
    },
    onError: (error) => {
      handleMutationError(error, 'entity', 'create');
    }
  });
}
```

### Hook de mise à jour (useUpdate{Entity})

```typescript
export function useUpdateEntity(entityId: string) {
  const queryClient = useQueryClient();
  const { data: entity } = useEntityById(entityId);
  
  return useMutation({
    mutationFn: async (data: UpdateEntityData) => {
      if (!entity) {
        throw new Error("Entity not found");
      }
      return await updateEntity(entityId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId] });
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      handleMutationSuccess('Entity', 'update');
      return data;
    },
    onError: (error) => {
      handleMutationError(error, 'entity', 'update');
    }
  });
}
```

### Hook de suppression (useDelete{Entity})

```typescript
export function useDeleteEntity(entityId: string, parentId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await deleteEntity(entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId] });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['entities', parentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['entities'] });
      }
      handleMutationSuccess('Entity', 'delete');
    },
    onError: (error) => {
      handleMutationError(error, 'entity', 'delete');
    }
  });
}
```

## Invalidation du cache

L'invalidation du cache doit suivre des conventions cohérentes:

- Invalidation de l'entité spécifique: `queryKey: ['entity', entityId]`
- Invalidation de toutes les entités du même type: `queryKey: ['entities']`
- Invalidation des entités liées à un parent: `queryKey: ['entities', parentId]`

## Personnalisation des messages

Les messages peuvent être personnalisés via les options des fonctions utilitaires:

```typescript
handleMutationSuccess('Entité', 'create', {
  title: 'Titre personnalisé',
  description: 'Description personnalisée',
  showToast: true
});

handleMutationError(error, 'entité', 'create', {
  title: 'Erreur personnalisée',
  description: 'Description personnalisée',
  showToast: true,
  logToConsole: true
});
```
