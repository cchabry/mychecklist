
# Anti-patterns à éviter

Ce document répertorie les anti-patterns spécifiques à notre projet et explique pourquoi ils sont problématiques.

## 1. Détection automatique du mode opérationnel

### Anti-pattern
Implémenter une logique complexe pour détecter automatiquement si l'application devrait être en mode réel ou en mode démonstration.

```typescript
// À éviter
function detectOperationMode() {
  if (process.env.NODE_ENV === 'development') {
    return 'demo';
  } else if (window.location.hostname.includes('staging')) {
    return isTokenValid() ? 'real' : 'demo';
  } else if (checkConnectivity()) {
    return 'real';
  } else {
    return 'demo';
  }
}
```

### Pourquoi c'est problématique
- Crée un comportement imprévisible et difficile à déboguer
- Rend les tests plus complexes à mettre en place
- Peut conduire à des problèmes de sécurité si le mode change sans que l'utilisateur en soit conscient
- Complique la gestion des états de l'application

### Solution recommandée
Utiliser un choix explicite du mode via une action utilisateur, avec une interface claire indiquant le mode actuel.

```typescript
function ModeToggle() {
  const { mode, setMode } = useOperationMode();
  
  return (
    <div className="mode-toggle">
      <span>Mode actuel: {mode === 'real' ? 'Réel' : 'Démo'}</span>
      <Button 
        onClick={() => setMode(mode === 'real' ? 'demo' : 'real')}
      >
        Basculer vers le mode {mode === 'real' ? 'Démo' : 'Réel'}
      </Button>
    </div>
  );
}
```

## 2. Accès direct à l'API Notion

### Anti-pattern
Appeler directement l'API Notion depuis les composants ou les hooks spécifiques aux fonctionnalités.

```typescript
// À éviter
function ProjectsList() {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch('https://api.notion.com/v1/databases/abc123/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ /* ... */ })
      });
      const data = await response.json();
      setProjects(data.results);
    };
    
    fetchProjects();
  }, []);
  
  // ...
}
```

### Pourquoi c'est problématique
- Pas d'abstraction, ce qui rend impossible le mode démo
- Duplication du code d'accès à l'API à travers l'application
- Difficulté à maintenir la cohérence de la gestion des erreurs
- Impossibilité de mettre en cache facilement les résultats
- Couplage fort entre les composants UI et l'API externe

### Solution recommandée
Utiliser les services et hooks d'accès aux données définis.

```typescript
// Service d'accès aux données
const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    // Utilise notionClient qui gère les headers, versions et format
    return notionClient.databases.query({
      database_id: databaseIds.projects,
      // ...
    }).then(mapResponseToProjects);
  }
};

// Hook d'utilisation
function useProjects() {
  const { mode } = useOperationMode();
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (mode === 'demo') {
        return mockProjects;
      }
      return projectsApi.getProjects();
    }
  });
}

// Composant
function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects();
  
  // ...
}
```

## 3. File d'attente complexe pour les retentatives

### Anti-pattern
Implémenter une file d'attente complexe pour réessayer automatiquement les requêtes échouées.

```typescript
// À éviter
class RequestQueue {
  private queue: Request[] = [];
  private isProcessing = false;
  
  addRequest(request: Request) {
    this.queue.push(request);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  private async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const request = this.queue[0];
      try {
        await this.executeRequest(request);
        this.queue.shift(); // Retirer de la file après succès
      } catch (error) {
        if (request.retries < 3) {
          request.retries++;
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * request.retries));
        } else {
          // Max retries reached, remove from queue
          this.queue.shift();
          request.onFailure(error);
        }
      }
    }
    this.isProcessing = false;
  }
  
  private async executeRequest(request: Request) {
    // ...
  }
}
```

### Pourquoi c'est problématique
- Ajoute une complexité inutile
- Difficile à déboguer
- Peut masquer des problèmes sous-jacents
- Augmente la surface d'erreurs potentielles
- Peut créer des situations de blocage ou de délais inattendus

### Solution recommandée
Utiliser TanStack Query pour la gestion des retries avec des paramètres explicites.

```typescript
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

function useSaveProject() {
  return useMutation({
    mutationFn: saveProject,
    retry: 1,
    onError: error => {
      // Gestion explicite de l'erreur avec feedback utilisateur
      console.error('Échec de sauvegarde du projet:', error);
      toast.error('La sauvegarde a échoué. Veuillez réessayer.');
    }
  });
}
```

## 4. Logique métier dans les composants

### Anti-pattern
Implémenter la logique métier directement dans les composants UI.

```typescript
// À éviter
function EvaluationForm({ auditId, pageId, exigenceId }) {
  const [score, setScore] = useState('non-conforme');
  const [comment, setComment] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Logique métier dans le composant
    if (score === 'non-applicable' && !comment) {
      setError('Un commentaire est requis pour une évaluation non applicable');
      return;
    }
    
    // Validation spécifique au domaine
    if (score === 'conforme' && exigenceId.startsWith('ACC')) {
      // Vérification spécifique pour les exigences d'accessibilité
      // ...
    }
    
    // Transformation des données
    const evaluation = {
      auditId,
      pageId,
      exigenceId,
      score,
      comment,
      timestamp: new Date().toISOString()
    };
    
    // Appel API direct
    const response = await fetch('/api/evaluations', {
      method: 'POST',
      body: JSON.stringify(evaluation)
    });
    
    // ...
  };
  
  // ...
}
```

### Pourquoi c'est problématique
- Rend le composant difficile à tester
- Mélange les responsabilités (UI et logique métier)
- Empêche la réutilisation de la logique métier
- Complique la maintenance et l'évolution du code

### Solution recommandée
Extraire la logique métier dans des hooks et services dédiés.

```typescript
// Service de validation
const evaluationValidationService = {
  validateEvaluation(evaluation: Evaluation): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (evaluation.score === 'non-applicable' && !evaluation.comment) {
      errors.push({ field: 'comment', message: 'Un commentaire est requis pour une évaluation non applicable' });
    }
    
    // Autres règles de validation
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Hook d'utilisation
function useEvaluationForm(auditId: string, pageId: string, exigenceId: string) {
  const [evaluation, setEvaluation] = useState<EvaluationFormData>({
    score: 'non-conforme',
    comment: ''
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  const saveMutation = useMutation({
    mutationFn: (data: EvaluationFormData) => saveEvaluation({
      auditId,
      pageId,
      exigenceId,
      ...data
    }),
    onSuccess: () => {
      // ...
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = evaluationValidationService.validateEvaluation({
      auditId,
      pageId,
      exigenceId,
      ...evaluation
    });
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    saveMutation.mutate(evaluation);
  };
  
  return {
    evaluation,
    setEvaluation,
    errors,
    isSubmitting: saveMutation.isPending,
    isSuccess: saveMutation.isSuccess,
    handleSubmit
  };
}

// Composant simplifié
function EvaluationForm({ auditId, pageId, exigenceId }) {
  const {
    evaluation,
    setEvaluation,
    errors,
    isSubmitting,
    handleSubmit
  } = useEvaluationForm(auditId, pageId, exigenceId);
  
  // UI pure sans logique métier
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

## 5. Couches d'abstraction excessives

### Anti-pattern
Créer de nombreuses couches d'abstraction intermédiaires sans valeur ajoutée claire.

```typescript
// À éviter
// Niveau 1: Composant
function ProjectsList() {
  const { projects } = useProjectsData();
  return <ProjectsListView projects={projects} />;
}

// Niveau 2: View component
function ProjectsListView({ projects }) {
  return <ProjectsListRenderer projects={projects} />;
}

// Niveau 3: Renderer
function ProjectsListRenderer({ projects }) {
  return (
    <ul>
      {projects.map(project => (
        <ProjectsListItemContainer key={project.id} project={project} />
      ))}
    </ul>
  );
}

// Niveau 4: Item container
function ProjectsListItemContainer({ project }) {
  const { handleEdit } = useProjectActions();
  return <ProjectsListItem project={project} onEdit={handleEdit} />;
}

// Niveau 5: Item component
function ProjectsListItem({ project, onEdit }) {
  return (
    <li>
      {project.name}
      <button onClick={() => onEdit(project.id)}>Modifier</button>
    </li>
  );
}
```

### Pourquoi c'est problématique
- Augmente la complexité du code sans bénéfice clair
- Rend le flux de données difficile à suivre
- Crée des indirections inutiles
- Augmente la surface de maintenance
- Impact négatif sur les performances (re-renders)

### Solution recommandée
Simplifier la hiérarchie des composants et n'ajouter des couches que lorsqu'elles apportent une valeur claire.

```typescript
// Liste principale avec logique de données
function ProjectsList() {
  const { data: projects, isLoading } = useProjects();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <ul className="projects-list">
      {projects.map(project => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </ul>
  );
}

// Composant d'item avec sa propre logique
function ProjectItem({ project }) {
  const navigate = useNavigate();
  const { mutate: deleteProject } = useDeleteProject();
  
  const handleEdit = () => navigate(`/projects/${project.id}/edit`);
  const handleDelete = () => deleteProject(project.id);
  
  return (
    <li className="project-item">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="actions">
        <Button onClick={handleEdit}>Modifier</Button>
        <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
      </div>
    </li>
  );
}
```
