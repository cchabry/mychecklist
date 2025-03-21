
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { getProjectById } from '@/lib/mockData';
import { cleanProjectId, resetApplicationState } from '@/lib/utils';
import { notionApi } from '@/lib/notionProxy';

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(notionApi.mockMode.isActive());
  const [cleanedId, setCleanedId] = useState<string | undefined>(undefined);
  const [originalId, setOriginalId] = useState<string | undefined>(undefined);
  
  // Charger les données du projet au montage
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      
      if (!id) {
        toast.error('ID de projet manquant');
        navigate('/');
        return;
      }
      
      setOriginalId(id);
      
      // Nettoyer l'ID du projet
      const cleanId = cleanProjectId(id);
      setCleanedId(cleanId);
      
      console.log(`EditProject - ID original: "${id}", ID nettoyé: "${cleanId}"`);
      
      try {
        // Charger le projet à partir de l'ID nettoyé
        const project = getProjectById(cleanId);
        
        if (!project) {
          toast.error('Projet non trouvé', {
            description: `Aucun projet trouvé avec l'ID "${cleanId}"`
          });
          navigate('/');
          return;
        }
        
        // Remplir le formulaire avec les données du projet
        setName(project.name);
        setUrl(project.url);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        toast.error('Erreur de chargement', {
          description: 'Impossible de charger les données du projet'
        });
        navigate('/');
      }
    };
    
    loadProject();
    setIsMockMode(notionApi.mockMode.isActive());
  }, [id, navigate]);
  
  // Force reset function
  const handleForceReset = () => {
    console.log('🔄 Performing force reset of mock mode from EditProject');
    resetApplicationState();
    toast.success('Application réinitialisée', {
      description: 'L\'application est prête à utiliser les données réelles.'
    });
    
    // Update state
    setIsMockMode(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // Validation de l'URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulation de mise à jour (à remplacer par l'API réelle)
      setTimeout(() => {
        toast.success('Projet mis à jour avec succès');
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error('Erreur de mise à jour', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du projet'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-tmw-teal/5">
        <Header />
        <main className="flex-1 container px-4 py-8 mx-auto max-w-3xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-tmw-teal/20 border-t-tmw-teal rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-tmw-darkgray">Chargement du projet...</p>
          </div>
        </main>
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
                  <CardTitle className="text-2xl text-tmw-darkgray">Modifier le projet</CardTitle>
                  <CardDescription>
                    Mettez à jour les informations du projet.
                  </CardDescription>
                </div>
              </div>
              
              {/* Débugger l'ID du projet */}
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-2">
                <p className="text-xs text-blue-800">
                  <strong>ID du projet:</strong>{' '}
                  <code className="bg-blue-100 px-1 py-0.5 rounded">{cleanedId}</code>
                  {originalId !== cleanedId && (
                    <span className="block mt-1">
                      <strong>ID original:</strong>{' '}
                      <code className="bg-blue-100 px-1 py-0.5 rounded">{originalId}</code>
                    </span>
                  )}
                </p>
              </div>
              
              {/* Indicateur de mode mock très visible */}
              {isMockMode && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-2 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <strong>Mode démonstration actif</strong>
                    <p className="text-xs mt-0.5">
                      Les modifications ne seront pas sauvegardées dans Notion.
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
              
              <CardFooter className="flex justify-between space-x-4 border-t border-tmw-teal/10 bg-tmw-teal/5 p-6">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </Button>
                
                <div className="flex gap-3">
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
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer"
                    )}
                  </Button>
                </div>
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

export default EditProject;
