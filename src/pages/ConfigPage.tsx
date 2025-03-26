
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Database, Settings, ExternalLink } from 'lucide-react';

/**
 * Page de configuration
 */
const ConfigPage = () => {
  return (
    <div>
      <PageHeader 
        title="Configuration" 
        description="Paramètres et configuration de l'application"
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Link to="/config/checklist">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-5 w-5 text-muted-foreground mb-2" />
              <CardTitle className="text-lg">Référentiel de bonnes pratiques</CardTitle>
              <CardDescription>Gérer le référentiel de bonnes pratiques (checklist)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Consultez et modifiez les critères d'évaluation qui servent de base pour les exigences des projets.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="h-full">
          <CardHeader>
            <Database className="h-5 w-5 text-muted-foreground mb-2" />
            <CardTitle className="text-lg">Configuration Notion</CardTitle>
            <CardDescription>Paramètres de connexion à Notion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              À implémenter dans les prochains sprints.
            </p>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader>
            <Settings className="h-5 w-5 text-muted-foreground mb-2" />
            <CardTitle className="text-lg">Préférences générales</CardTitle>
            <CardDescription>Paramètres généraux de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              À implémenter dans les prochains sprints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfigPage;
