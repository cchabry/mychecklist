
import { PageHeader } from '@/components/layout';

/**
 * Page principale de la checklist
 */
const ChecklistPage = () => {
  return (
    <div>
      <PageHeader 
        title="Checklist" 
        description="Consultez et gérez les critères d'évaluation"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">La gestion de la checklist sera implémentée dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ChecklistPage;
