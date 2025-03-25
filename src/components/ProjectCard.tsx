
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
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectAudits } from '@/hooks/useProjectAudits';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project
}) => {
  // Récupérer les audits réels depuis Notion
  const { audits, isLoading: isLoadingAudits, error: auditsError } = useProjectAudits(project.id);

  // Vérifier et normaliser l'ID du projet
  const getCleanProjectId = () => {
    if (!project || !project.id) {
      console.error("Projet sans ID détecté:", project);
      return '';
    }
    
    return project.id;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date inconnue';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Récupérer le dernier audit du projet
  const getLatestAudit = () => {
    if (!audits || audits.length === 0) return null;
    
    // Trier les audits par date de mise à jour (du plus récent au plus ancien)
    return audits.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })[0];
  };

  const latestAudit = getLatestAudit();
  const cleanProjectId = getCleanProjectId();
  
  // Calculer le nombre total d'actions correctrices
  const getTotalActions = () => {
    if (!latestAudit || !latestAudit.actionsCount) return 0;
    return latestAudit.actionsCount.total || 0;
  };
  
  // Calculer le nombre d'actions terminées
  const getCompletedActions = () => {
    if (!latestAudit || !latestAudit.actionsCount) return 0;
    return latestAudit.actionsCount[ActionStatus.Done] || 0;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl truncate" title={project.name}>
          {project.name}
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span className="flex items-center text-xs">
            <Clock size={12} className="mr-1" />
            {formatDate(project.updatedAt)}
          </span>
          
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center text-blue-500 hover:text-blue-700">
              <ExternalLink size={12} className="mr-1" /> Voir
            </a>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-3">
        {/* Progression du projet */}
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Progression</span>
            <span className="font-medium">{project.progress || 0}%</span>
          </div>
          <Progress value={project.progress || 0} className="h-2" />
        </div>
        
        {/* Statut du dernier audit */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Dernier audit</span>
            {isLoadingAudits ? (
              <Skeleton className="h-4 w-24" />
            ) : audits.length > 0 ? (
              <Badge variant="outline" className="text-xs font-normal">
                {latestAudit?.name || 'Aucun nom'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-normal bg-gray-50">
                Aucun audit
              </Badge>
            )}
          </div>
          
          {isLoadingAudits ? (
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : latestAudit ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1 bg-gray-50 rounded-md">
                  <div className="font-medium">{latestAudit.itemsCount || 0}</div>
                  <div className="text-gray-500">Items</div>
                </div>
                <div className="p-1 bg-blue-50 rounded-md">
                  <div className="font-medium text-blue-700">{latestAudit.progress || 0}%</div>
                  <div className="text-blue-500">Score</div>
                </div>
                <div className="p-1 bg-green-50 rounded-md">
                  <div className="font-medium text-green-700">
                    {getCompletedActions()}/{getTotalActions()}
                  </div>
                  <div className="text-green-500">Actions</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 flex items-center">
                <Clock size={12} className="mr-1" />
                Mis à jour {formatDate(latestAudit.updatedAt)}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 italic text-center py-2">
              Aucun audit disponible
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full gap-2">
          {latestAudit ? (
            <>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to={`/project/${cleanProjectId}/audit/${latestAudit.id}`}>
                  <FileText size={16} className="mr-2" />
                  Consulter
                </Link>
              </Button>
              
              <Button asChild size="sm" className="flex-1">
                <Link to={`/project/${cleanProjectId}/audit/new`}>
                  <Play size={16} className="mr-2" />
                  Nouvel audit
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to={`/project/${cleanProjectId}/edit`}>
                  <Pencil size={16} className="mr-2" />
                  Éditer
                </Link>
              </Button>
              
              <Button asChild size="sm" className="flex-1">
                <Link to={`/project/${cleanProjectId}/audit/new`}>
                  <FilePlus size={16} className="mr-2" />
                  Créer audit
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
