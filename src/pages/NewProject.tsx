
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { isNotionConfigured, createProjectInNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

const NewProject = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usingNotion, setUsingNotion] = useState(isNotionConfigured());
  const [isMockMode, setIsMockMode] = useState(notionApi.mockMode.isActive());
  const [hasChecklistDb, setHasChecklistDb] = useState(!!localStorage.getItem('notion_checklists_database_id'));

  // Force reset function
  const handleForceReset = () => {
    console.log('Performing force reset of mock mode from NewProject');
    notionApi.mockMode.forceReset();
    toast.success('Mode réinitalisé', {
      description: 'L\'application est prête à utiliser les données réelles.'
    });
    
    // Update state
    setIsMockMode(false);
    setUsingNotion(isNotionConfigured());
  };
  
  // Vérifier l'état de l'intégration Notion au chargement et à l'intervalle
  useEffect(() => {
    // Vérifier si le mode mock est actif
    const checkMockMode = () => {
      const mockActive = notionApi.mockMode.isActive();
      setIsMockMode(mockActive);
      
      // Vérifier si la base de données de checklists est configurée
      const checklistDbId = localStorage.getItem('notion_checklists_database_id');
      setHasChecklistDb(!!checklistDbId);
      
      if (mockActive) {
        console.log('📢 NewProject: Mode mock Notion actif - données de DÉMONSTRATION');
      } else {
        console.log('📢 NewProject: Mode réel Notion actif - données RÉELLES');
      }
    };
    
    // Vérifier au chargement
    checkMockMode();
    setUsingNotion(isNotionConfigured());
    
    // Vérifier à nouveau à chaque fois que le composant devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkMockMode();
        setUsingNotion(isNotionConfigured());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Verifier toutes les 5 secondes au cas où
    const interval = setInterval(checkMockMode, 5000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Forcer la désactivation du mode mock pour la création si Notion est configuré
      const notionConfigured = isNotionConfigured();
      let forcedRealMode = false;

      if (notionApi.mockMode.isActive() && notionConfigured) {
        console.log('🚨 Force désactivation du mode mock pour la création du projet');
        notionApi.mockMode.deactivate();
        forcedRealMode = true;
      }
      
      // Double vérification du mode mock juste avant création
      const isMockModeActive = notionApi.mockMode.isActive();
      console.log(`📊 Mode mock au moment de créer un projet: ${isMockModeActive ? 'ACTIF' : 'INACTIF'}`);
      
      // Si Notion est configuré et qu'on n'est pas en mode mock, créer le projet dans Notion
      if (notionConfigured && !isMockModeActive) {
        console.log('🔄 Création de projet dans Notion (mode RÉEL)', { name, url });
        
        // Essayer de créer le projet dans Notion
        try {
          // Nettoyer le cache avant création
          localStorage.removeItem('projects_cache');

          const project = await createProjectInNotion(name, url);
          
          if (project) {
            console.log('✅ Projet créé avec succès dans Notion:', project);
            toast.success("Projet créé avec succès", {
              description: "Le projet a été ajouté à votre base de données Notion",
            });
            
            // Forcer un court délai avant la redirection pour laisser le temps à Notion de traiter
            setTimeout(() => {
              navigate('/');
            }, 1500);
            return;
          } else {
            console.error('❌ Échec de création dans Notion (null)');
            throw new Error("Impossible de créer le projet dans Notion");
          }
        } catch (notionError) {
          console.error('❌ Erreur lors de la création dans Notion:', notionError);
          
          if (forcedRealMode) {
            // Si on avait forcé le mode réel mais ça a échoué, on réactive le mode mock
            console.log('🔄 Réactivation du mode mock après échec de création');
            notionApi.mockMode.activate();
          }
          
          // Si erreur de type "Failed to fetch", activer le mode mock
          if (notionError.message?.includes('Failed to fetch') || 
              notionError.message?.includes('401') || 
              notionError.message?.includes('403')) {
            console.log('🚨 Erreur de connexion détectée, activation du mode mock');
            notionApi.mockMode.activate();
            
            // Créer un projet fictif après l'erreur
            console.log('🔄 Création de projet fictif après échec Notion');
            toast.success("Projet créé en mode démonstration", {
              description: "Le projet a été créé en mode démonstration suite à un problème de connexion à Notion.",
            });
            
            // Forcer un court délai avant la redirection
            setTimeout(() => {
              navigate('/');
            }, 1000);
            return;
          } else {
            // Autre type d'erreur
            throw notionError;
          }
        }
      } else {
        // Mode mock - créer un projet fictif
        console.log('🔄 Création de projet fictif (mode DÉMONSTRATION)');
        
        // Simulation de création
        setTimeout(() => {
          console.log('✅ Projet fictif créé avec succès');
          toast.success("Projet créé en mode démonstration", {
            description: "Le projet a été ajouté en mode simulation.",
          });
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erreur générale lors de la création du projet:', error);
      toast.error("Erreur de création", {
        description: "Une erreur est survenue lors de la création du projet",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
                  <CardTitle className="text-2xl text-tmw-darkgray">Nouveau projet</CardTitle>
                  <CardDescription>
                    Créez un nouveau projet à auditer selon notre référentiel de bonnes pratiques.
                  </CardDescription>
                </div>
              </div>
              
              {/* Indicateur de mode mock très visible */}
              {isMockMode && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-2 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <strong>Mode démonstration actif</strong>
                    <p className="text-xs mt-0.5">
                      Les projets créés ne seront pas sauvegardés dans Notion.
                      <div className="flex mt-1 space-x-2">
                        <Button 
                          variant="outline" 
                          className="text-xs py-0 h-6 px-2 border-amber-300 text-amber-700"
                          onClick={handleForceReset}
                        >
                          <RefreshCw size={12} className="mr-1" />
                          Réinitialiser
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-xs p-0 h-auto underline text-amber-700"
                          onClick={() => {
                            notionApi.mockMode.deactivate();
                            setIsMockMode(false);
                          }}
                        >
                          Désactiver
                        </Button>
                      </div>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Indicateur de mode réel */}
              {usingNotion && !isMockMode && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-2 flex items-start gap-2">
                  <CheckSquare size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-700">
                    <strong>Mode réel actif</strong>
                    <p className="text-xs mt-0.5">
                      Le projet sera sauvegardé dans votre base Notion.
                      {!hasChecklistDb && (
                        <span className="block mt-1 text-amber-600">
                          Base de données des checklists non configurée.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du projet <span className="text-error">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Mon site web"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-tmw-teal/20 focus:border-tmw-teal focus:ring-tmw-teal/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL du site <span className="text-error">*</span></Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="border-tmw-teal/20 focus:border-tmw-teal focus:ring-tmw-teal/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez l'URL complète du site à auditer, incluant https://
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-4 border-t border-tmw-teal/10 bg-tmw-teal/5 p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                  className="border-tmw-coral/30 text-tmw-coral hover:bg-tmw-coral/10 hover:text-tmw-coral hover:border-tmw-coral/50"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px] bg-tmw-teal hover:bg-tmw-teal/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création...
                    </>
                  ) : (
                    "Créer le projet"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
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

export default NewProject;
