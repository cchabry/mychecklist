
import { PageHeader } from '@/components/layout';

/**
 * Page de configuration
 */
const ConfigPage = () => {
  return (
    <div>
      <PageHeader 
        title="Configuration" 
        description="Paramètres et configuration de l'application"
      />
      <div className="grid gap-6">
        {/* Contenu à venir dans les prochains sprints */}
        <p className="text-muted-foreground">Les paramètres de configuration seront implémentés dans les prochains sprints.</p>
      </div>
    </div>
  );
};

export default ConfigPage;
