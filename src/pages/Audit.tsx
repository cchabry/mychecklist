
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ChecklistItem from '@/components/ChecklistItem';
import ProgressBar from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  getProjectById, 
  createMockAudit, 
  CATEGORIES, 
  createNewAudit 
} from '@/lib/mockData';
import { Audit, AuditItem, ComplianceStatus, COMPLIANCE_VALUES } from '@/lib/types';
import { ArrowLeft, Save } from 'lucide-react';

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(getProjectById(projectId || ''));
  const [audit, setAudit] = useState<Audit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!projectId || !project) {
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    // Simuler le chargement de l'audit depuis une API
    const timer = setTimeout(() => {
      const mockAudit = project.progress === 0 
        ? createNewAudit(projectId) 
        : createMockAudit(projectId);
      setAudit(mockAudit);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [projectId, project, navigate]);
  
  const handleItemChange = (itemId: string, status: ComplianceStatus, comment?: string) => {
    if (!audit) return;
    
    const updatedItems = audit.items.map(item => 
      item.id === itemId 
        ? { ...item, status, comment } 
        : item
    );
    
    // Recalculer le score
    const evaluatedItems = updatedItems.filter(
      item => item.status !== ComplianceStatus.NotEvaluated
    );
    
    let score = 0;
    if (evaluatedItems.length > 0) {
      const totalPossiblePoints = evaluatedItems.length;
      const earnedPoints = evaluatedItems.reduce(
        (sum, item) => sum + COMPLIANCE_VALUES[item.status], 
        0
      );
      score = Math.round((earnedPoints / totalPossiblePoints) * 100);
    }
    
    setAudit({
      ...audit,
      items: updatedItems,
      score,
      updatedAt: new Date().toISOString()
    });
  };
  
  const saveAudit = () => {
    toast.success("Audit sauvegardé avec succès", {
      description: "Toutes les modifications ont été enregistrées",
    });
  };
  
  const getFilteredItems = () => {
    if (!audit) return [];
    return selectedCategory === 'all' 
      ? audit.items 
      : audit.items.filter(item => item.category === selectedCategory);
  };
  
  const getCompletionStats = () => {
    if (!audit) return { evaluated: 0, total: 0 };
    const evaluated = audit.items.filter(
      item => item.status !== ComplianceStatus.NotEvaluated
    ).length;
    return { evaluated, total: audit.items.length };
  };
  
  const stats = getCompletionStats();
  const filteredItems = getFilteredItems();
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'audit...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project || !audit) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Projet non trouvé</h2>
            <p className="text-muted-foreground mb-6">
              Le projet que vous cherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour aux projets
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">{project.url}</p>
            </div>
            
            <Button onClick={saveAudit}>
              <Save size={16} className="mr-2" />
              Sauvegarder
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ProgressBar 
            progress={stats.evaluated} 
            total={stats.total} 
            score={audit.score} 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Critères d'audit</h2>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                {CATEGORIES.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value={selectedCategory} className="mt-0">
              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ChecklistItem 
                      item={item} 
                      onChange={handleItemChange} 
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <footer className="py-6 border-t border-border/60 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WebAudit - Audits Qualité Web
        </div>
      </footer>
    </div>
  );
};

export default AuditPage;
