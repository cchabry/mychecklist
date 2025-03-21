import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotion } from '@/contexts/NotionContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, ClipboardList, FileCheck, ListChecks, Database, LucideActivity } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { notionDiagnostic } from '@/lib/notion/diagnosticHelper';

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
import { CorrectiveAction, SamplePage } from '@/lib/types';

interface AuditContainerProps {
  projectId: string;
  onError?: (error: any) => void;
}

export const AuditContainer: React.FC<AuditContainerProps> = ({ projectId, onError }) => {
  console.log("AuditContainer rendering with projectId:", projectId);
  
  // Ne plus forcer le mode mock par défaut
  // Référence pour suivre les diagnostics
  const diagnosticRun = useRef(false);
  
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
  const [samplePages, setSamplePages] = useState<SamplePage[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
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
    mockModeActive,
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
  
  // Charger les pages d'échantillon au montage
  useEffect(() => {
    if (project && project.id) {
      const pages = getPagesByProjectId(project.id);
      setSamplePages(pages);
    }
  }, [project]);
  
  const handleUpdateAudit = (updatedAudit) => {
    console.log("Updating audit state");
    setAudit(updatedAudit);
  };
  
  const handleForceReset = () => {
    console.log("Force resetting all caches from AuditContainer");
    // Réinitialiser les caches
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    // Tenter de désactiver le mode mock
    notionApi.mockMode.forceReset();
    
    toast.info("Réinitialisation effectuée", {
      description: "Les données vont être rechargées avec le mode réel"
    });
    
    // Réinitialiser le flag pour permettre de recharger
    dataInitialized.current = false;
    
    setTimeout(() => {
      loadProject();
    }, 600);
  };
  
  // Lancer un diagnostic complet
  const handleRunDiagnostic = async () => {
    setIsDiagnosing(true);
    toast.info('Diagnostic Notion en cours', {
      description: 'Vérification de la connexion et des bases de données...'
    });
    
    try {
      const result = await notionDiagnostic.runFullDiagnostic();
      diagnosticRun.current = true;
      
      if (result.success) {
        toast.success('Diagnostic réussi', {
          description: 'La connexion à Notion fonctionne correctement'
        });
        
        // Désactiver le mode mock si le diagnostic réussit
        if (notionApi.mockMode.isActive()) {
          notionApi.mockMode.forceReset();
          console.log('Mode mock désactivé suite au diagnostic réussi');
          
          // Rafraîchir les données
          dataInitialized.current = false;
          setTimeout(() => {
            loadProject();
          }, 600);
        }
      } else {
        toast.error('Problèmes détectés', {
          description: result.message,
          action: {
            label: 'Tenter réparation',
            onClick: () => notionDiagnostic.fixNotionIssues()
          }
        });
        
        // Afficher les détails dans la console pour déboguer
        console.error('Détails du diagnostic:', result.details);
      }
    } catch (error) {
      toast.error('Erreur de diagnostic', {
        description: error.message || 'Une erreur est survenue pendant le diagnostic'
      });
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  // Gestionnaire pour la mise à jour d'une action corrective
  const handleActionUpdate = useCallback((updatedAction: CorrectiveAction) => {
    if (!audit || !audit.items) return;
    
    // Trouver l'item qui contient cette action
    const updatedItems = audit.items.map(item => {
      if (!item.actions) return item;
      
      const actionIndex = item.actions.findIndex(action => action.id === updatedAction.id);
      
      if (actionIndex >= 0) {
        // Mettre à jour l'action dans le tableau
        const updatedActions = [...item.actions];
        updatedActions[actionIndex] = updatedAction;
        
        return {
          ...item,
          actions: updatedActions
        };
      }
      
      return item;
    });
    
    // Mettre à jour l'audit avec les items mis à jour
    const updatedAudit = {
      ...audit,
      items: updatedItems
    };
    
    setAudit(updatedAudit);
    
    // Sauvegarder automatiquement après une mise à jour d'action
    setTimeout(() => {
      handleSaveAudit();
      toast.success("Plan d'action mis à jour", {
        description: "Les modifications ont été enregistrées"
      });
    }, 300);
  }, [audit, setAudit, handleSaveAudit]);
  
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
  
  console.log("AuditContainer state:", { loading, hasProject: !!project, hasAudit: !!audit, mockModeActive });
  
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
                  title="Réinitialiser les données et forcer le mode réel"
                >
                  <RefreshCw size={16} />
                  Réinitialiser
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleRunDiagnostic}
                  disabled={isDiagnosing}
                  title="Exécuter un diagnostic Notion complet"
                >
                  {isDiagnosing ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <LucideActivity size={16} />
                  )}
                  Diagnostic
                </Button>
                
                <NotionConnectButton 
                  usingNotion={usingNotion} 
                  onClick={handleConnectNotionClick}
                  id="notion-connect-button"
                />
              </div>
            </div>
            
            {mockModeActive && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Mode démonstration actif</span>
                </div>
                <p className="mt-1 text-xs">
                  Les données affichées sont fictives. Cliquez sur "Diagnostic" pour tester la connexion à Notion ou "Réinitialiser" pour forcer le mode réel.
                </p>
              </div>
            )}
            
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
                pages={samplePages}
                onActionUpdate={handleActionUpdate}
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
