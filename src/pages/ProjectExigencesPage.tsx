
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';

/**
 * Page des exigences d'un projet
 */
const ProjectExigencesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div>
      <PageHeader 
        title="Exigences du projet" 
        description="Gestion des exigences et critères d'évaluation"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">ID du projet: {projectId}</p>
        <p className="text-muted-foreground">La gestion des exigences sera implémentée dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ProjectExigencesPage;
