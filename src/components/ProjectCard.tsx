
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Play, FileText, ExternalLink, Pencil, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Project, ActionStatus } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

// Données fictives pour les audits - à remplacer par des données réelles
const mockAudits = [
  { 
    id: '1', 
    name: 'Audit initial', 
    updatedAt: new Date('2023-06-15').toISOString(), 
    progress: 65,
    itemsCount: 24,
    actionsCount: {
      total: 12,
      [ActionStatus.ToDo]: 5,
      [ActionStatus.InProgress]: 4,
      [ActionStatus.Done]: 3
    }
  },
  { 
    id: '2', 
    name: 'Audit de suivi', 
    updatedAt: new Date('2023-09-22').toISOString(), 
    progress: 30,
    itemsCount: 18,
    actionsCount: {
      total: 8,
      [ActionStatus.ToDo]: 6,
      [ActionStatus.InProgress]: 2,
      [ActionStatus.Done]: 0
    }
  }
];

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card className="bg-[#fff8f0] backdrop-blur-md rounded-lg border border-tmw-teal/20 shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="relative">
        <Link 
          to={`/project/edit/${project.id}`} 
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-tmw-teal transition-colors"
        >
          <Pencil size={16} />
        </Link>
        
        <CardTitle className="text-[#4A968C] text-xl font-semibold">{project.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
          <ExternalLink size={14} />
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {project.url}
          </a>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {mockAudits.map((audit) => (
          <div key={audit.id} className="bg-white/70 p-3 rounded-md border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-800">{audit.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Mis à jour {formatDistanceToNow(new Date(audit.updatedAt), { addSuffix: true, locale: fr })}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progression</span>
                  <span>{audit.progress}%</span>
                </div>
                <Progress value={audit.progress} className="h-2" />
                <p className="text-xs mt-1 text-muted-foreground">
                  {Math.round(audit.progress * audit.itemsCount / 100)} / {audit.itemsCount} critères évalués
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 px-2 gap-1 text-xs" asChild>
                    <Link to={`/audit/plan/${project.id}/${audit.id}`}>
                      <FileText size={12} />
                      Plan d'action
                    </Link>
                  </Button>
                  
                  <div className="flex gap-1 text-xs items-center ml-1">
                    <Badge variant="outline" className="text-xs text-red-500 font-normal py-0 h-5">
                      <Clock size={10} className="mr-0.5" />
                      {audit.actionsCount[ActionStatus.ToDo]}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-blue-500 font-normal py-0 h-5">
                      <Clock size={10} className="mr-0.5" />
                      {audit.actionsCount[ActionStatus.InProgress]}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-green-500 font-normal py-0 h-5">
                      <CheckCircle size={10} className="mr-0.5" />
                      {audit.actionsCount[ActionStatus.Done]}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className="gap-1.5 bg-[#E87A69] text-white hover:bg-[#E87A69]/90 h-7"
                  asChild
                >
                  <Link to={`/audit/${project.id}/${audit.id}`}>
                    <Play size={12} />
                    {audit.progress > 0 ? 'Poursuivre' : 'Démarrer'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
