
# Guide pratique des patterns architecturaux

Ce guide illustre avec des exemples concrets les patterns architecturaux à utiliser dans le projet.

## 1. Structure des features

Chaque fonctionnalité (feature) doit suivre la structure standard définie dans l'architecture de référence.

### ✅ Exemple correct

```
/features/projects
  /components
    ProjectCard.tsx
    ProjectForm.tsx
    index.ts
  /hooks
    useProjects.ts
    useProjectById.ts
    index.ts
  types.ts
  utils.ts
  constants.ts
  index.ts
```

### ❌ Anti-pattern à éviter

```
/features/projects
  ProjectCard.tsx    // Composants directement à la racine
  useProjects.ts     // Hooks mélangés avec les composants
  index.ts
```

## 2. Accès aux données avec React Query

### ✅ Exemple correct

```typescript
// hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      return await getProjects();
    }
  });
}

// Service d'accès aux données
export async function getProjects(): Promise<Project[]> {
  try {
    return await projectsApi.getProjects();
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    throw new Error(`Impossible de récupérer les projets: ${getErrorMessage(error)}`);
  }
}
```

### ❌ Anti-pattern à éviter

```typescript
// Appel direct à l'API dans le composant
function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, []);
  
  // ...
}
```

## 3. Gestion des erreurs

### ✅ Exemple correct

```typescript
// Utilisation du hook de gestion d'erreurs
function ProjectForm() {
  const { handleError } = useErrorHandler();
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onError: (error) => {
      handleError(error, {
        title: "Échec de création du projet",
        fallbackMessage: "Une erreur s'est produite lors de la création du projet"
      });
    }
  });
  
  // ...
}
```

### ❌ Anti-pattern à éviter

```typescript
// Gestion d'erreur inconsistante
function ProjectForm() {
  const createProject = async () => {
    try {
      await fetch('/api/projects', { method: 'POST', body: JSON.stringify(data) });
      alert('Projet créé avec succès');
    } catch (e) {
      console.log('error', e);
      // Pas de feedback utilisateur
    }
  };
  
  // ...
}
```

## 4. Utilisation des contextes

### ✅ Exemple correct

```typescript
// Contexte pour le mode opérationnel
export const OperationModeContext = createContext<OperationModeContextType | undefined>(undefined);

export function OperationModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<OperationMode>('real');
  
  const value = {
    mode,
    setMode,
    isDemoMode: mode === 'demo',
    isRealMode: mode === 'real'
  };
  
  return (
    <OperationModeContext.Provider value={value}>
      {children}
    </OperationModeContext.Provider>
  );
}

// Utilisation via hook
export function useOperationMode() {
  const context = useContext(OperationModeContext);
  if (context === undefined) {
    throw new Error('useOperationMode must be used within an OperationModeProvider');
  }
  return context;
}
```

### ❌ Anti-pattern à éviter

```typescript
// Variables globales ou props drilling
let globalMode = 'real';

function setGlobalMode(mode) {
  globalMode = mode;
  // Pas de réaction React à ce changement
}

// Ou pire : props drilling sur plusieurs niveaux
function App() {
  const [mode, setMode] = useState('real');
  return <Layout mode={mode} setMode={setMode} />;
}

function Layout({ mode, setMode }) {
  return <Sidebar mode={mode} setMode={setMode} />;
}

function Sidebar({ mode, setMode }) {
  return <ModeToggle mode={mode} setMode={setMode} />;
}
```

## 5. Organisation des imports

### ✅ Exemple correct

```typescript
// Imports groupés et ordonnés
// 1. Imports de bibliothèques externes
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports de composants/hooks/utils internes
import { Button } from '@/components/ui/button';
import { useProjects } from '@/features/projects';

// 3. Imports de types
import type { Project } from '@/types';

// 4. Imports de constantes/assets
import { PROJECT_STATUS } from '@/constants';
import projectIcon from '@/assets/icons/project.svg';
```

### ❌ Anti-pattern à éviter

```typescript
// Imports non triés et désorganisés
import projectIcon from './project.svg';
import { PROJECT_STATUS } from '../../constants';
import React, { useState, Fragment, useEffect } from 'react';
import type { Project } from '../../types';
import { Button } from '../../components/ui/button';
import { useProjects } from '../hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
```

## 6. Typage des props de composants

### ✅ Exemple correct

```typescript
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  className?: string;
}

export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  isSelected = false,
  className 
}: ProjectCardProps) {
  // ...
}
```

### ❌ Anti-pattern à éviter

```typescript
// Props non typées ou incomplètes
export function ProjectCard(props) {
  const { project } = props;
  // ...
}

// Ou avec any
export function ProjectCard(props: any) {
  // ...
}
```

## 7. Tests unitaires

### ✅ Exemple correct

```typescript
// Test d'un hook
describe('useProjects', () => {
  it('should return projects when query succeeds', async () => {
    // Setup
    const mockProjects = [{ id: '1', name: 'Test Project' }];
    mockedGetProjects.mockResolvedValue(mockProjects);
    
    // Exécution
    const { result } = renderHook(() => useProjects());
    
    // Attente de la résolution de la requête
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    // Vérification
    expect(result.current.data).toEqual(mockProjects);
  });
  
  it('should handle errors properly', async () => {
    // Setup
    const error = new Error('Failed to fetch');
    mockedGetProjects.mockRejectedValue(error);
    
    // Exécution
    const { result } = renderHook(() => useProjects());
    
    // Attente de la résolution de la requête
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    // Vérification
    expect(result.current.error).toBeDefined();
  });
});
```

### ❌ Anti-pattern à éviter

```typescript
// Tests incomplets ou inexistants
test('useProjects', () => {
  const { result } = renderHook(() => useProjects());
  // Pas d'assertions
});

// Ou tests qui ne testent pas vraiment la fonctionnalité
test('useProjects returns data', () => {
  const { result } = renderHook(() => useProjects());
  expect(result.current).toBeDefined();
  // Ne teste pas si les données sont correctes ou si les erreurs sont gérées
});
```
