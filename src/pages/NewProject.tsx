
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare } from 'lucide-react';

const NewProject = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler un appel API pour créer le projet
    setTimeout(() => {
      toast.success("Projet créé avec succès", {
        description: "Vous pouvez maintenant commencer l'audit",
      });
      setIsSubmitting(false);
      navigate('/');
    }, 1500);
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
