
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { Audit } from '@/lib/types';
import {
  getProjectById as getNotionProject,
  getAuditForProject, 
  saveAuditToNotion, 
  isNotionConfigured
} from '@/lib/notion';
import Header from '@/components/Header';
import AuditHeader from './components/AuditHeader';
import AuditProgress from './components/AuditProgress';
import AuditChecklist from './components/AuditChecklist';
import AuditLoader from './components/AuditLoader';
import AuditNotFound from './components/AuditNotFound';
import NotionConfig from '@/components/NotionConfig';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

export const AuditContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  const [usingNotion, setUsingNotion] = useState(isNotionConfigured());
  
  const loadProject = async () => {
    setLoading(true);
    
    if (!projectId) {
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    try {
      let projectData = null;
      let auditData = null;
      
      // Try to load from Notion if configured
      if (usingNotion) {
        try {
          projectData = await getNotionProject(projectId);
          
          if (projectData) {
            auditData = await getAuditForProject(projectId);
          }
        } catch (notionError) {
          console.error('Erreur Notion:', notionError);
          // Continue with mock data on Notion error
        }
      }
      
      // If no data from Notion, use mock data
      if (!projectData) {
        console.log('Loading mock data for project', projectId);
        projectData = getProjectById(projectId);
        
        if (projectData) {
          setProject(projectData);
          
          // Load mock audit with a slight delay for UX
          setTimeout(() => {
            const mockAudit = projectData.progress === 0 
              ? createNewAudit(projectId) 
              : createMockAudit(projectId);
            setAudit(mockAudit);
            setLoading(false);
          }, 800);
          return; // Exit early as we're handling loading state in setTimeout
        }
      } else {
        // Successfully loaded from Notion
        setProject(projectData);
        setAudit(auditData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les données du projet'
      });
      
      // Fallback to mock data
      try {
        const mockProjectData = getProjectById(projectId);
        setProject(mockProjectData);
        
        if (mockProjectData) {
          const mockAudit = mockProjectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          setAudit(mockAudit);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
      
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadProject();
  }, [projectId, usingNotion, navigate]);
  
  const handleSaveAudit = async () => {
    if (!audit) return;
    
    try {
      let success = false;
      
      if (usingNotion) {
        // Sauvegarder dans Notion
        success = await saveAuditToNotion(audit);
      } else {
        // Simulation locale de sauvegarde
        success = true;
      }
      
      if (success) {
        toast.success("Audit sauvegardé avec succès", {
          description: "Toutes les modifications ont été enregistrées",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder les modifications'
      });
    }
  };
  
  const handleConnectNotionClick = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setUsingNotion(true);
    loadProject();
  };
  
  if (loading) {
    return <AuditLoader />;
  }
  
  if (!project || !audit) {
    return <AuditNotFound navigate={navigate} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-tmw-teal/5">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <AuditHeader 
            project={project} 
            onSave={handleSaveAudit} 
            onBack={() => navigate('/')} 
          />
          
          <Button
            variant="outline"
            className="flex items-center gap-2 text-tmw-teal border-tmw-teal/20 hover:bg-tmw-teal/5"
            onClick={handleConnectNotionClick}
          >
            <Database size={16} />
            {usingNotion ? 'Reconfigurer Notion' : 'Connecter à Notion'}
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AuditProgress audit={audit} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AuditChecklist 
            audit={audit}
            onUpdateAudit={setAudit}
          />
        </motion.div>
      </main>
      
      <footer className="py-6 border-t border-tmw-teal/10 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} myChecklist - Audits Qualité Web
          <div className="mt-2 text-xs text-muted-foreground/70">by ThinkMyWeb</div>
        </div>
      </footer>
      
      <NotionConfig 
        isOpen={notionConfigOpen} 
        onClose={() => setNotionConfigOpen(false)}
        onSuccess={handleNotionConfigSuccess}
      />
    </div>
  );
};
