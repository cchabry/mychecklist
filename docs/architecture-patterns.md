
# Patterns architecturaux de référence

Ce document définit les patterns architecturaux officiels à utiliser dans le projet.

## Structure des features

Chaque feature doit suivre la structure suivante:

```
/feature-name
  /components        # Composants spécifiques à la feature
  /hooks             # Hooks spécifiques à la feature
  types.ts           # Types spécifiques à la feature
  utils.ts           # Utilitaires spécifiques à la feature
  constants.ts       # Constantes spécifiques à la feature
  index.ts           # Point d'entrée exportant les éléments publics
```

### Règles pour les fichiers index.ts

- Le fichier `index.ts` à la racine de la feature doit réexporter tous les éléments publics
- Les fichiers `index.ts` dans les sous-dossiers doivent réexporter tous les éléments du dossier
- Aucune logique métier ne doit être présente dans les fichiers index

## Patterns pour l'accès aux données

### Pattern recommandé

```typescript
// 1. Déclaration des hooks d'accès aux données
export function useEntityItems() {
  return useQuery({
    queryKey: ['entityItems'],
    queryFn: async () => {
      return await getEntityItems();
    }
  });
}

// 2. Fonction d'accès aux données (dans index.ts)
export async function getEntityItems(): Promise<EntityItem[]> {
  try {
    return await entityApi.getEntityItems();
  } catch (error) {
    console.error(`Erreur lors de la récupération des entités:`, error);
    throw new Error(`Impossible de récupérer les entités: ${getErrorMessage(error)}`);
  }
}

// 3. API de service (dans services/notion/api/entityItems.ts)
export const entityItemsApi = {
  getEntityItems: async (): Promise<EntityItem[]> => {
    // Implémentation...
  }
};
```

## Gestion des erreurs

### Pattern de gestion d'erreurs

```typescript
// 1. Fonction avec try/catch
export async function getEntity(id: string): Promise<Entity | null> {
  try {
    return await entityApi.getEntity(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'entité ${id}:`, error);
    return null; // ou throw si l'échec doit être propagé
  }
}

// 2. Propagation d'erreur avec contexte
export async function updateEntity(id: string, data: UpdateEntityData): Promise<Entity> {
  try {
    const result = await entityApi.updateEntity(id, data);
    return result;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'entité ${id}:`, error);
    throw new Error(`Impossible de mettre à jour l'entité: ${getErrorMessage(error)}`);
  }
}

// 3. Fonction utilitaire pour extraire le message d'erreur
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
```

## Structure des hooks

### Pattern de hook d'accès aux données

```typescript
export function useEntity(id: string) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: async () => {
      return await getEntity(id);
    },
    enabled: !!id
  });
}
```

### Pattern de hook de mutation

```typescript
export function useCreateEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEntityData) => {
      return await createEntity(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la création:', error);
      // Afficher un message d'erreur à l'utilisateur
    }
  });
}
```

## Structure des services

### Service API

```typescript
export const entityApi = {
  getEntities: async (): Promise<Entity[]> => {
    // Implémentation
  },
  
  getEntityById: async (id: string): Promise<Entity | null> => {
    // Implémentation
  },
  
  createEntity: async (data: CreateEntityData): Promise<Entity> => {
    // Implémentation
  },
  
  updateEntity: async (entity: Entity): Promise<Entity> => {
    // Implémentation
  },
  
  deleteEntity: async (id: string): Promise<boolean> => {
    // Implémentation
  }
};
```

## Structure des composants

### Organisation des props

```typescript
// 1. Interface pour les props
interface EntityCardProps {
  entity: Entity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// 2. Composant avec destructuration des props
export function EntityCard({ entity, onEdit, onDelete, className }: EntityCardProps) {
  // Implémentation
}
```

## Utilitaires génériques

Utiliser des utilitaires génériques pour les opérations communes:

```typescript
export function formatDate(date: string): string {
  // Implémentation
}

export function filterEntities<T>(
  entities: T[],
  filterFn: (entity: T) => boolean
): T[] {
  return entities.filter(filterFn);
}
```

