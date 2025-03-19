
import React from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AuditLoader from './audit/components/AuditLoader';
import { Button } from '@/components/ui/button';
import { 
  AuditChecklist, 
  AuditHeader, 
  AuditLayout, 
  AuditProgress
} from './audit/components';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { createMockAudit } from '@/lib/mockData';
import { Audit, Project } from '@/lib/types';

// Données statiques de démonstration pour le prototype
const MOCK_PROJECT: Project = {
  id: 'project-1',
  name: 'Site Web Démo',
  url: 'https://example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  progress: 0.35,
  itemsCount: 15
};

const MOCK_AUDIT = createMockAudit('project-1');

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = React.useState(true);
  const [project] = React.useState<Project>(MOCK_PROJECT);
  const [audit, setAudit] = React.useState<Audit>(MOCK_AUDIT);
  
  // Afficher les données mockées après un court délai pour simuler le chargement
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Délai intentionnel pour montrer l'écran de chargement
    
    return () => clearTimeout(timer);
  }, []);

  // Handler de sauvegarde simulée
  const handleSaveAudit = () => {
    toast.success("Audit sauvegardé", {
      description: "Les données ont été sauvegardées localement pour la démonstration"
    });
  };
  
  // Handler pour mise à jour de l'audit
  const handleUpdateAudit = (updatedAudit: Audit) => {
    setAudit(updatedAudit);
  };
  
  // Handler pour réinitialiser les données de démo
  const handleForceReset = () => {
    setLoading(true);
    setTimeout(() => {
      setAudit(createMockAudit('project-1'));
      setLoading(false);
      toast.info("Données réinitialisées", {
        description: "Les données de démonstration ont été rechargées"
      });
    }, 500);
  };
  
  // Si aucun projectId n'est fourni, on utilise le projet de démo par défaut
  const displayProjectId = projectId || 'project-1';
  
  if (loading) {
    return <AuditLoader />;
  }
  
  return (
    <AuditLayout>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <AuditHeader 
            project={project} 
            onSave={handleSaveAudit} 
            onBack={() => window.location.href = '/'} 
          />
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-red-500"
              onClick={handleForceReset}
              title="Réinitialiser les données du prototype"
            >
              <RefreshCw size={16} />
              Réinitialiser
            </Button>
          </div>
        </div>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="font-medium">Mode prototype actif</span>
          </div>
          <p className="mt-1 text-xs">
            Les données affichées sont fictives et uniquement destinées à la démonstration du prototype.
            Identifiant du projet : {displayProjectId}
          </p>
        </div>
        
        <AuditProgress audit={audit} />
      </div>
      
      <AuditChecklist 
        audit={audit} 
        onUpdateAudit={handleUpdateAudit}
      />
    </AuditLayout>
  );
};

export default AuditPage;
