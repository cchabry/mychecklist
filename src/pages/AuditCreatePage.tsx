
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/**
 * Page de création d'un nouvel audit pour un projet
 */
const AuditCreatePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Veuillez saisir un nom pour cet audit');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Cette fonctionnalité sera implémentée ultérieurement
      // Pour l'instant, on simule une création réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Audit créé avec succès');
      navigate(`/projects/${projectId}/audits`);
    } catch (error) {
      console.error('Erreur lors de la création de l\'audit:', error);
      toast.error('Erreur lors de la création de l\'audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tertiary/20 p-6">
      <PageHeader 
        title="Créer un nouvel audit" 
        description="Démarrer un nouvel audit pour ce projet"
      />
      
      <form onSubmit={handleSubmit}>
        <Card className="max-w-xl mx-auto bg-white/90">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'audit *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de l'audit"
                required
              />
              <p className="text-sm text-muted-foreground">
                Donnez un nom significatif à cet audit pour le retrouver facilement.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/projects/${projectId}/audits`)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? 'Création...' : 'Créer l\'audit'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default AuditCreatePage;
