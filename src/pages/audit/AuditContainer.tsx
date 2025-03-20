
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotion } from '@/contexts/NotionContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, ClipboardList, FileCheck, ListChecks } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';

import { 
  AuditChecklist, 
  AuditHeader, 
  AuditLayout, 
  AuditLoader, 
  AuditNotFound, 
  AuditProgress,
  NotionConnectButton,
  ActionPlan
} from './components';
import { NotionErrorDetails } from '@/components/notion';
import { useAuditData } from './hooks/useAuditData';
import { toast } from 'sonner';

interface AuditContainerProps {
  projectId: string;
  onError?: (error: any) => void;
}

export const AuditContainer: React.FC<AuditContainerProps> = ({ projectId, onError }) => {
  console.log("AuditContainer rendering with projectId:", projectId);
  
  // Référence pour suivre si le mode démo a été activé
  const mockModeActivated = useRef(false);
  
  // Force le mode démo, mais une seule fois
  useEffect(() => {
    if (!mockModeActivated.current && !notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo pour le prototype");
      notionApi.mockMode.activate();
      mockModeActivated.current = true;
    }
  }, []);
  
  const navigate = useNavigate();
  const { status, config, usingNotion, testConnection } = useNotion();
  
  // Débogage important - assurons-nous que le projectId est bien là
  console.log("Project ID dans AuditContainer:", projectId);
  
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  const [notionErrorDetails, setNotionErrorDetails] = useState({
    show: false,
    error: '',
    context: ''
  });
  const [activeTab, setActiveTab] = useState<'checklist' | 'actions'>('checklist');
  
  const handleConnectNotionClick = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setNotionConfigOpen(false);
    testConnection();
    
    // Force a reload of the project data
    loadProject();
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
  };
  
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  // Référence pour éviter de charger plusieurs fois
  const dataInitialized = useRef(false);
  
  // Utilisation explicite du hook avec le projectId explicitement fourni
  const { 
    project, 
    audit, 
    loading, 
    notionError,
    hasChecklistDb,
    setAudit, 
    handleSaveAudit,
    loadProject 
  } = useAuditData(projectId);
  
  useEffect(() => {
    if (notionError) {
      console.log("Showing Notion error from audit data:", notionError);
      // Call the onError prop if provided
      if (onError) {
        onError(notionError);
      }
    }
  }, [notionError, onError]);
  
  // Ne charge le projet qu'une seule fois au montage
  useEffect(() => {
    if (projectId && !dataInitialized.current) {
      console.log("Loading project data");
      loadProject();
      dataInitialized.current = true;
    }
  }, [projectId, loadProject]);
  
  const handleUpdateAudit = (updatedAudit) => {
    console.log("Updating audit state");
    setAudit(updatedAudit);
  };
  
  const handleForceReset = () => {
    console.log("Force resetting all caches from AuditContainer");
    // Pour le prototype, on reste en mode démo
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    toast.info("Réinitialisation effectuée", {
      description: "Les données vont être rechargées"
    });
    
    // Réinitialiser le flag pour permettre de recharger
    dataInitialized.current = false;
    
    setTimeout(() => {
      loadProject();
    }, 600);
  };
  
  // Si le projectId est manquant, afficher un message d'erreur
  if (!projectId) {
    console.error("No projectId provided to AuditContainer");
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur: ID de projet manquant</h2>
          <p className="text-gray-600 mb-4">Impossible d'afficher cet audit sans identifiant de projet.</p>
          <Button onClick={() => navigate('/')}>Retourner à l'accueil</Button>
        </div>
      </div>
    );
  }
  
  console.log("AuditContainer state:", { loading, hasProject: !!project, hasAudit: !!audit });
  
  return (
    <AuditLayout
      notionConfigOpen={notionConfigOpen}
      onNotionConfigClose={handleNotionConfigClose}
      onNotionConfigSuccess={handleNotionConfigSuccess}
    >
      {loading ? (
        <AuditLoader />
      ) : !project || !audit ? (
        <AuditNotFound navigate={navigate} />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <AuditHeader 
                project={project} 
                onSave={handleSaveAudit} 
                onBack={() => navigate('/')} 
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
                
                <NotionConnectButton 
                  usingNotion={usingNotion} 
                  onClick={handleConnectNotionClick}
                  id="notion-connect-button"
                />
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="font-medium">Mode prototype actif</span>
              </div>
              <p className="mt-1 text-xs">
                Les données affichées sont fictives et uniquement destinées à la démonstration du prototype.
              </p>
            </div>
            
            <AuditProgress audit={audit} />
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'checklist' | 'actions')}>
            <TabsList className="mb-6">
              <TabsTrigger value="checklist" className="flex items-center gap-2">
                <ListChecks size={16} />
                Critères d'audit
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <ClipboardList size={16} />
                Plan d'action
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="mt-0">
              <AuditChecklist 
                audit={audit} 
                onUpdateAudit={handleUpdateAudit}
              />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0">
              <ActionPlan 
                audit={audit}
                pages={project && project.pagesCount ? getPagesByProjectId(project.id) : []}
                onActionUpdate={(updatedAction) => {
                  // Note: cette fonction devra être implémentée pour mettre à jour une action spécifique
                  console.log("Action mise à jour:", updatedAction);
                  toast.info("Mise à jour d'action non implémentée dans le prototype");
                }}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
      
      <NotionErrorDetails
        isOpen={notionErrorDetails.show}
        onClose={hideNotionError}
        error={notionErrorDetails.error}
        context={notionErrorDetails.context}
      />
    </AuditLayout>
  );
};

// Fonction temporaire pour obtenir les pages d'un projet, à remplacer par un hook
function getPagesByProjectId(projectId: string) {
  // Cette fonction sera remplacée par l'utilisation d'un hook dédié
  return [
    {
      id: "page-1",
      projectId,
      url: "https://example.com/home",
      title: "Page d'accueil",
      description: "Page principale du site",
      order: 1
    },
    {
      id: "page-2",
      projectId,
      url: "https://example.com/contact",
      title: "Page Contact",
      description: "Page de contact avec formulaire",
      order: 2
    },
    {
      id: "page-3",
      projectId,
      url: "https://example.com/about",
      title: "À propos",
      description: "Présentation de l'entreprise",
      order: 3
    }
  ];
}
