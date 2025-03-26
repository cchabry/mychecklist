
import { PageHeader } from '@/components/layout';

/**
 * Page de configuration
 */
const ConfigPage = () => {
  return (
    <div>
      <PageHeader 
        title="Configuration" 
        description="Paramètres et outils de configuration"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">La configuration sera implémentée dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ConfigPage;
