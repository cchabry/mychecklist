
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare, Loader2, AlertCircle, Info, Home } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { createMockAudit, getProjectById, getAllProjects } from '@/lib/mockData';
import { Project, Audit } from '@/lib/types';
import { cleanProjectId } from '@/lib/utils';

const NewAuditPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isMockMode, setIsMockMode] = useState(notionApi.mockMode.isActive());
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // Charger les données du projet
  useEffect(() => {
    console.log("NewAuditPage - projectId reçu:", projectId);
    
    if (!projectId) {
      setErrorDetails("ID de projet non spécifié");
      toast.error("ID de projet non spécifié");
      setIsLoading(false);
      return;
    }
    
    const cleanedProjectId = cleanProjectId(projectId);
    console.log("NewAuditPage - projectId nettoyé:", cleanedProjectId);
    
    const fetchProject = async () => {
      setIsLoading(true);
      
      try {
        // Simuler un délai pour l'expérience utilisateur
        await notionApi.mockMode.applySimulatedDelay();
        
        // Pour la démo, utiliser les données mock pour tous les cas
        let projectData = getProjectById(cleanedProjectId || projectId);
        
        console.log("NewAuditPage - Projet trouvé:", projectData ? "Oui" : "Non");
        
        // Si projet non trouvé, essayer une recherche plus approfondie
        if (!projectData) {
          // Afficher tous les projets disponibles pour déboguer
          const allProjects = getAllProjects();
          console.log("NewAuditPage - Tous les projets disponibles:", allProjects.map(p => ({ id: p.id, name: p.name })));
          
          // Si projet non trouvé mais qu'il s'agit d'un ID mock-project, créer un projet fictif
          if (cleanedProjectId && cleanedProjectId.toString().startsWith('mock-project-')) {
            console.log("Création d'un nouveau projet mock à partir de l'ID généré", cleanedProjectId);
            projectData = {
              id: cleanedProjectId.toString(),
              name: `Projet ${cleanedProjectId.toString().substring(12)}`,
              url: "https://example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              progress: 0,
              itemsCount: 15,
              pagesCount: 0
            };
          } else {
            setErrorDetails(`Projet avec ID "${cleanedProjectId || projectId}" non trouvé dans la base de données`);
            throw new Error(`Projet avec ID "${cleanedProjectId || projectId}" non trouvé dans la base de données`);
          }
        }
        
        if (projectData) {
          setProject(projectData);
          // Initialiser le nom de l'audit avec le nom du projet
          setName(`Audit de ${projectData.name} - ${new Date().toLocaleDateString()}`);
        } else {
          setErrorDetails(`Projet non trouvé malgré les tentatives de récupération (ID: ${cleanedProjectId || projectId})`);
          toast.error("Projet non trouvé", {
            description: `ID: ${cleanedProjectId || projectId}`
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Erreur lors du chargement du projet:", error);
        setErrorDetails(errorMessage);
        toast.error("Impossible de charger les données du projet", {
          description: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
    
    // Vérifier l'état du mode mock
    const checkMockMode = () => {
      setIsMockMode(notionApi.mockMode.isActive());
    };
    
    checkMockMode();
    const interval = setInterval(checkMockMode, 1000);
    
    return () => clearInterval(interval);
  }, [projectId, navigate]);
  
  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Veuillez saisir un nom pour l'audit");
      return;
    }
    
    if (!project) {
      toast.error("Projet non trouvé");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simuler un délai pour l'expérience utilisateur
      await notionApi.mockMode.applySimulatedDelay();
      
      // Pour la démo, créer un audit mock
      const cleanedProjectId = cleanProjectId(projectId) || projectId;
      const auditData: Audit = createMockAudit(cleanedProjectId);
      
      // Mettre à jour le nom et la description
      auditData.name = name;
      
      toast.success("Audit créé avec succès", {
        description: "Vous allez être redirigé vers l'interface d'évaluation"
      });
      
      // Rediriger vers la page d'audit après un court délai
      setTimeout(() => {
        console.log("Redirection vers la page d'audit:", `/audit/${cleanedProjectId}/${auditData.id}`);
        navigate(`/audit/${cleanedProjectId}/${auditData.id}`);
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Erreur lors de la création de l'audit:", error);
      setErrorDetails(errorMessage);
      toast.error("Impossible de créer l'audit", {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Si une erreur est survenue, afficher un écran d'erreur
  if (errorDetails && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container px-4 py-8 mx-auto max-w-3xl flex items-center justify-center">
          <Card className="w-full border border-red-200 shadow-md">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-2">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-700">Erreur lors du chargement du projet</CardTitle>
                  <CardDescription className="text-red-600">
                    Impossible de créer un nouvel audit
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="font-medium flex items-center gap-1 text-gray-700 mb-2">
                    <Info size={16} className="text-blue-500" />
                    Détails du problème
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">{errorDetails}</p>
                    <div className="text-xs bg-gray-100 p-2 rounded-md mt-2 font-mono">
                      <p><strong>ID reçu:</strong> {projectId || 'aucun'}</p>
                      <p><strong>ID nettoyé:</strong> {cleanProjectId(projectId) || 'échec du nettoyage'}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="default"
                  onClick={() => navigate('/')}
                  className="w-full bg-tmw-teal hover:bg-tmw-teal/90"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-tmw-teal/5">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 hover:text-tmw-teal"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Button>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-tmw-teal" />
            <span className="ml-2">Chargement du projet...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border border-tmw-teal/20 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-tmw-teal/10 bg-tmw-teal/5">
                <div className="flex items-center gap-3">
                  <div className="bg-tmw-coral rounded-full p-1.5">
                    <CheckSquare size={18} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-tmw-darkgray">Nouvel audit</CardTitle>
                    <CardDescription>
                      Créez un nouvel audit pour le projet {project?.name}.
                    </CardDescription>
                  </div>
                </div>
                
                {/* Informations sur l'ID du projet pour débogage */}
                <div className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-md p-2">
                  <p className="text-gray-500">
                    <span className="font-medium">ID du projet:</span> {project?.id}
                    {cleanProjectId(projectId) !== projectId && (
                      <span className="ml-2">
                        (nettoyé depuis <code className="bg-gray-100 px-1 py-0.5 rounded">{projectId}</code>)
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Indicateur de mode mock */}
                {isMockMode && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-2 flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700">
                      <strong>Mode démonstration actif</strong>
                      <p className="text-xs mt-0.5">
                        L'audit créé ne sera pas sauvegardé dans Notion.
                      </p>
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <form onSubmit={handleCreateAudit}>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'audit <span className="text-error">*</span></Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-tmw-teal/20 focus:border-tmw-teal focus:ring-tmw-teal/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnelle)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="border-tmw-teal/20 focus:border-tmw-teal focus:ring-tmw-teal/20"
                      placeholder="Ajoutez des informations contextuelles pour cet audit..."
                    />
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Détails du projet</h3>
                    <div className="bg-muted/50 rounded-md p-3 text-sm">
                      <p><span className="text-muted-foreground">Nom:</span> {project?.name}</p>
                      <p><span className="text-muted-foreground">URL:</span> {project?.url}</p>
                      <p><span className="text-muted-foreground">Créé le:</span> {new Date(project?.createdAt ?? '').toLocaleDateString()}</p>
                      <p className="mt-2 text-xs text-amber-600">
                        Note: Les pages de l'échantillon du projet seront utilisées pour cet audit.
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-4 border-t border-tmw-teal/10 bg-tmw-teal/5 p-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isSaving}
                    className="border-tmw-coral/30 text-tmw-coral hover:bg-tmw-coral/10 hover:text-tmw-coral hover:border-tmw-coral/50"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="min-w-[120px] bg-tmw-teal hover:bg-tmw-teal/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer l'audit"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </main>
      
      <footer className="py-6 border-t border-tmw-teal/10 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} myChecklist - Audits Qualité Web
          <div className="mt-2 text-xs text-muted-foreground/70">by ThinkMyWeb</div>
        </div>
      </footer>
    </div>
  );
};

export default NewAuditPage;
