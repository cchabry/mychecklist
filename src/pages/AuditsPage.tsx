
import { PageHeader } from '@/components/layout';

/**
 * Page principale des audits
 */
const AuditsPage = () => {
  return (
    <div>
      <PageHeader 
        title="Audits" 
        description="Consultez et gérez les audits des projets"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">La gestion des audits sera implémentée dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default AuditsPage;
