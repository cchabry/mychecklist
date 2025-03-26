
import { PageHeader } from '@/components/layout';

/**
 * Page principale des projets
 */
const ProjectsPage = () => {
  return (
    <div>
      <PageHeader 
        title="Projets" 
        description="Consultez et gérez vos projets d'audit"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">La liste des projets sera implémentée dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ProjectsPage;
