
import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notionService } from '@/services/notion/notionService';

/**
 * Page de configuration de l'API Notion
 */
const NotionConfigPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState({
    apiKey: localStorage.getItem('notion_api_key') || '',
    projectsDbId: localStorage.getItem('notion_database_id') || '',
    checklistsDbId: localStorage.getItem('notion_checklists_database_id') || ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.apiKey || !config.projectsDbId) {
      toast.error('La clé API et l\'ID de la base de données des projets sont requis');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Configurer le service Notion
      notionService.configure({
        apiKey: config.apiKey,
        projectsDbId: config.projectsDbId,
        checklistsDbId: config.checklistsDbId || undefined,
        mockMode: false
      });
      
      // Tester la connexion
      const result = await notionService.testConnection();
      
      if (result.success) {
        // Sauvegarder la configuration dans le localStorage
        localStorage.setItem('notion_api_key', config.apiKey);
        localStorage.setItem('notion_database_id', config.projectsDbId);
        
        if (config.checklistsDbId) {
          localStorage.setItem('notion_checklists_database_id', config.checklistsDbId);
        }
        
        toast.success('Configuration Notion sauvegardée', {
          description: `Connecté en tant que ${result.user}`
        });
        
        // Rediriger vers la page d'accueil
        navigate('/');
      } else {
        toast.error('Erreur de connexion à Notion', {
          description: result.error
        });
      }
    } catch (error) {
      console.error('Erreur lors de la configuration Notion:', error);
      toast.error('Erreur lors de la configuration Notion', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!config.apiKey || !config.projectsDbId) {
      toast.error('La clé API et l\'ID de la base de données des projets sont requis');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Configurer temporairement le service Notion
      notionService.configure({
        apiKey: config.apiKey,
        projectsDbId: config.projectsDbId,
        checklistsDbId: config.checklistsDbId || undefined,
        mockMode: false
      });
      
      // Tester la connexion
      const result = await notionService.testConnection();
      
      if (result.success) {
        toast.success('Connexion à Notion réussie', {
          description: `Connecté en tant que ${result.user}`
        });
      } else {
        toast.error('Erreur de connexion à Notion', {
          description: result.error
        });
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion Notion:', error);
      toast.error('Erreur lors du test de connexion Notion', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUseDemoMode = () => {
    // Activer le mode démo
    notionService.setMockMode(true);
    toast.success('Mode démo activé', {
      description: 'Utilisation de données fictives'
    });
    navigate('/');
  };
  
  return (
    <div className="p-6">
      <PageHeader 
        title="Configuration Notion" 
        description="Connectez l'application à votre espace Notion"
      />
      
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration de l'API Notion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border border-blue-200">
              <AlertDescription className="text-blue-800">
                <p>
                  Pour utiliser l'application avec Notion, vous devez fournir une clé API Notion et 
                  les identifiants de vos bases de données.
                </p>
                <a 
                  href="https://developers.notion.com/docs/create-a-notion-integration"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
                >
                  <ExternalLink size={14} />
                  <span>Voir la documentation pour créer une intégration Notion</span>
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key size={16} className="text-gray-500" />
                  Clé API Notion *
                </Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  value={config.apiKey}
                  onChange={handleChange}
                  placeholder="secret_XYZ123..."
                  className="font-mono"
                  required
                />
                <p className="text-xs text-gray-500">
                  Clé secrète de votre intégration Notion
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectsDbId" className="flex items-center gap-2">
                  <Database size={16} className="text-gray-500" />
                  ID de la base de données des projets *
                </Label>
                <Input
                  id="projectsDbId"
                  name="projectsDbId"
                  value={config.projectsDbId}
                  onChange={handleChange}
                  placeholder="83d9d3a270ff4b0a95856a96db5a7e35"
                  className="font-mono"
                  required
                />
                <p className="text-xs text-gray-500">
                  Identifiant de votre base de données Notion pour les projets 
                  (format: 32 caractères alphanumériques)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="checklistsDbId" className="flex items-center gap-2">
                  <Database size={16} className="text-gray-500" />
                  ID de la base de données des checklists (optionnel)
                </Label>
                <Input
                  id="checklistsDbId"
                  name="checklistsDbId"
                  value={config.checklistsDbId}
                  onChange={handleChange}
                  placeholder="83d9d3a270ff4b0a95856a96db5a7e35"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  Identifiant de votre base de données Notion pour les checklists 
                  (format: 32 caractères alphanumériques)
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t p-6">
              <div className="space-x-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isSubmitting}
                >
                  Tester la connexion
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleUseDemoMode}
                  disabled={isSubmitting}
                >
                  Mode démonstration
                </Button>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer la configuration'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default NotionConfigPage;
