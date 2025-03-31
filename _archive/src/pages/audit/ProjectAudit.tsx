
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { cleanProjectId } from '@/lib/utils';
import { Audit, Project, SamplePage } from '@/lib/types';

import Header from '@/components/Header';
import AuditNotFound from './components/AuditNotFound';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createMockAudit, getPagesByProjectId } from '@/lib/mockData';
import { 
  AuditChecklist,
  AuditHeader,
  AuditProgress,
  ActionPlan,
} from './components';
import { ListChecks, ClipboardList, Layers } from 'lucide-react';
import SamplePageManagerCard from './components/SamplePageManagerCard';
import { useSamplePages } from './hooks/useSamplePages';

const ProjectAudit: React.FC = () => {
  const { projectId, auditId } = useParams<{ projectId: string; auditId?: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'actions' | 'pages'>('checklist');

  const cleanedProjectId = cleanProjectId(projectId);

  // Utilisation du hook pour gérer les échantillons de pages
  const { 
    pages, 
    loading: pagesLoading, 
    addPage, 
    removePage, 
    updatePage 
  } = useSamplePages(cleanedProjectId || '');

  useEffect(() => {
    const loadData = async () => {
      if (!cleanedProjectId) {
        setError("ID de projet invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Chargement du projet
        const projectData = await notionApi.getProject(cleanedProjectId);
        if (!projectData) {
          setError("Projet non trouvé");
          return;
        }
        setProject(projectData);
        
        // Si un auditId est fourni, chargement de l'audit
        if (auditId) {
          try {
            const auditData = await notionApi.getAudit(auditId);
            if (!auditData) {
              setError("Audit non trouvé");
              return;
            }
            setAudit(auditData);
          } catch (auditErr: any) {
            console.error(`Erreur lors du chargement de l'audit ${auditId}:`, auditErr);
            setError(auditErr.message || "Impossible de charger l'audit");
          }
        } else {
          // Création d'un nouvel audit si aucun auditId n'est fourni
          const newAudit = createMockAudit(cleanedProjectId);
          setAudit(newAudit);
        }
        
        setError(null);
      } catch (err: any) {
        console.error(`Erreur lors du chargement du projet ${cleanedProjectId}:`, err);
        setError(err.message || "Impossible de charger le projet");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cleanedProjectId, auditId]);

  // Fonction de mise à jour de l'audit
  const handleUpdateAudit = (updatedAudit: Audit) => {
    setAudit(updatedAudit);
  };

  // Fonction de sauvegarde de l'audit
  const handleSaveAudit = () => {
    toast.success("Audit sauvegardé", {
      description: "Les modifications ont été enregistrées"
    });
  };

  // Si les données sont en cours de chargement
  if (isLoading || pagesLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Card className="max-w-4xl mx-auto animate-pulse">
            <CardContent className="p-6 h-96"></CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Si une erreur s'est produite ou si le projet n'a pas été trouvé
  if (error || !project || !audit) {
    return <AuditNotFound navigate={navigate} projectId={projectId} error={error || undefined} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <AuditHeader 
              project={project} 
              onSave={handleSaveAudit} 
              onBack={() => navigate('/')} 
            />
          </div>
          
          <AuditProgress audit={audit} />
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'checklist' | 'actions' | 'pages')}>
          <TabsList className="mb-6">
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Layers size={16} />
              Échantillon de pages
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <ListChecks size={16} />
              Critères d'audit
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <ClipboardList size={16} />
              Plan d'action
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pages" className="mt-0">
            <SamplePageManagerCard 
              pages={pages}
              onAddPage={(page) => addPage({...page, projectId: cleanedProjectId || ''})}
              onRemovePage={removePage}
              onUpdatePage={updatePage}
              className="mb-6"
            />
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setActiveTab('checklist')}
                className="ml-auto"
              >
                Continuer vers les critères d'audit
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="checklist" className="mt-0">
            <AuditChecklist 
              audit={audit} 
              onUpdateAudit={handleUpdateAudit}
            />
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setActiveTab('actions')}
                className="ml-auto"
              >
                Voir le plan d'action
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="mt-0">
            <ActionPlan 
              audit={audit}
              pages={pages}
              onActionUpdate={(updatedAction) => {
                const updatedAudit = { ...audit };
                // Logique de mise à jour de l'action
                handleUpdateAudit(updatedAudit);
              }}
            />
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab('checklist')}
              >
                Retour aux critères
              </Button>
              
              <Button 
                onClick={handleSaveAudit}
              >
                Sauvegarder l'audit
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectAudit;
