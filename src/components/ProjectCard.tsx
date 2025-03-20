
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Play, FileText, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Project, Audit } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Simulons des audits pour chaque projet
  // Dans une version finale, ceux-ci viendraient des données réelles
  const mockAudits: Audit[] = [
    {
      id: `audit-1-${project.id}`,
      projectId: project.id,
      name: "Audit initial",
      createdAt: new Date(project.createdAt).toISOString(),
      updatedAt: new Date(project.updatedAt).toISOString(),
      score: Math.floor(project.progress * 0.8),
      items: [],
      progress: project.progress
    }
  ];
  
  // Si le projet a un avancement supérieur à 50%, ajoutons un deuxième audit
  if (project.progress > 50) {
    mockAudits.push({
      id: `audit-2-${project.id}`,
      projectId: project.id,
      name: "Audit de suivi",
      createdAt: new Date(new Date(project.updatedAt).getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      updatedAt: new Date(new Date(project.updatedAt).getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      score: Math.floor(project.progress * 0.9),
      items: [],
      progress: Math.min(project.progress + 20, 100)
    });
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md rounded-lg border border-tmw-blue/10 shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <ExternalLink size={14} />
          {project.url || 'https://example.com'}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8"
          asChild
        >
          <Link to={`/project/${project.id}/edit`}>
            <Pencil size={16} />
            <span className="sr-only">Modifier le projet</span>
          </Link>
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        {mockAudits.map((audit, index) => (
          <div key={audit.id} className="border-t pt-2 first:border-t-0 first:pt-0">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="text-sm font-medium">{audit.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Mis à jour {formatDistanceToNow(new Date(audit.updatedAt), { addSuffix: true, locale: fr })}
                </p>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{audit.progress}%</span>
              </div>
              <Progress value={audit.progress} className="h-2" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {project.itemsCount} critères à évaluer
                </span>
                <Button
                  asChild
                  size="sm"
                  variant={audit.progress === 0 ? "default" : "outline"}
                  className="gap-1.5"
                >
                  <Link to={`/audit/${project.id}`}>
                    <Play size={14} />
                    {audit.progress === 0 ? "Démarrer" : "Poursuivre"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t pt-3">
        <div className="text-xs text-muted-foreground">
          Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
        </div>
        
        <Button
          asChild
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <Link to={`/project/${project.id}/action-plan`}>
            Plan d'action
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
