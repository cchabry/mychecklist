
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Play, FileText, ExternalLink, Pencil, Clock, CheckCircle, Circle, AlertCircle, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, ActionStatus } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

// Données fictives pour les audits - à remplacer par des données réelles
const mockAudits = [{
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
}, {
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
}];

const ProjectCard: React.FC<ProjectCardProps> = ({
  project
}) => {
  return (
    <Card className="bg-[#fff8f0] backdrop-blur-md rounded-lg border border-tmw-teal/20 shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link to={`/project/edit/${project.id}`} className="p-1.5 text-gray-500 hover:text-tmw-teal transition-colors">
            <Pencil size={16} />
          </Link>
        </div>
        
        <CardTitle className="text-[#4A968C] text-xl font-semibold">{project.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
          <ExternalLink size={14} />
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {project.url}
          </a>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {mockAudits.length > 0 ? (
          mockAudits.map(audit => (
            <div key={audit.id} className="bg-white/70 p-3 rounded-md border border-gray-100 relative">
              <Link 
                to={`/audit/${project.id}/${audit.id}`}
                className="absolute top-3 right-3 text-tmw-coral hover:text-tmw-coral/80 transition-colors" 
                title={audit.progress > 0 ? "Poursuivre l'audit" : "Démarrer l'audit"}
              >
                <Play size={16} />
              </Link>
              
              <div className="mb-2">
                <h4 className="font-medium text-gray-800">{audit.name}</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">Progression</span>
                    <span className="text-xs">{audit.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Progress value={audit.progress} className="h-2" />
                      <p className="text-xs mt-1 text-muted-foreground">
                        {Math.round(audit.progress * audit.itemsCount / 100)} / {audit.itemsCount} critères évalués
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 gap-1 text-xs flex items-center" 
                    asChild
                  >
                    <Link to={`/audit/plan/${project.id}/${audit.id}`}>
                      <FileText size={12} />
                      Plan d'action
                      <Circle size={12} className="ml-1 text-red-500" />
                      <span className="text-red-500">{audit.actionsCount[ActionStatus.ToDo]}</span>
                      <span className="mx-0.5 text-muted-foreground">|</span>
                      <Clock size={12} className="text-blue-500" />
                      <span className="text-blue-500">{audit.actionsCount[ActionStatus.InProgress]}</span>
                      <span className="mx-0.5 text-muted-foreground">|</span>
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-green-500">{audit.actionsCount[ActionStatus.Done]}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/70 p-4 rounded-md border border-gray-100 text-center">
            <p className="text-muted-foreground mb-3">Aucun audit pour ce projet</p>
          </div>
        )}
        
        {/* Bouton Nouvel Audit */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-white hover:bg-tmw-teal/10 border-tmw-teal/20 text-tmw-teal"
          asChild
        >
          <Link to={`/audit/new/${project.id}`} className="flex items-center justify-center">
            <FilePlus size={16} className="mr-2" />
            Nouvel audit
          </Link>
        </Button>
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
