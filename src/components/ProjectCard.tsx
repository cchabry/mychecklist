
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
    
    console.log(`Traitement de l'ID projet original: "${project.id}"`);
    
    // Si c'est déjà une chaîne simple, la retourner directement
    if (typeof project.id === 'string' && !project.id.startsWith('"')) {
      console.log(`ID projet déjà propre: "${project.id}"`);
      return project.id;
    }
    
    // Nettoyer l'ID du projet s'il est entouré de guillemets
    try {
      if (typeof project.id === 'string' && 
          project.id.startsWith('"') && 
          project.id.endsWith('"')) {
        const cleanedId = JSON.parse(project.id);
        console.log(`ID projet nettoyé de JSON: "${project.id}" => "${cleanedId}"`);
        return cleanedId;
      }
    } catch (e) {
      console.error(`Erreur lors du nettoyage de l'ID projet: "${project.id}"`, e);
    }
    
    // Si on arrive ici, retourner l'ID tel quel
    return project.id;
  };
  
  const cleanProjectId = getCleanProjectId();

  return (
    <Card className="bg-[#fff8f0] backdrop-blur-md rounded-lg border border-tmw-teal/20 shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link 
            to={`/project/edit/${cleanProjectId}`} 
            className="p-1.5 text-gray-500 hover:text-tmw-teal transition-colors"
            title={`Modifier le projet ${project.name} (ID: ${cleanProjectId})`}
          >
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
        {isLoadingAudits ? (
          // État de chargement
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-8 w-48" />
          </div>
        ) : auditsError ? (
          // Erreur de chargement
          <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800">
            <p className="text-sm font-medium">Erreur de chargement</p>
            <p className="text-xs mt-1">Impossible de récupérer les audits de ce projet.</p>
          </div>
        ) : audits.length > 0 ? (
          // Afficher les audits récupérés
          audits.map(audit => (
            <div key={audit.id} className="bg-white/70 p-3 rounded-md border border-gray-100 relative">
              <Link 
                to={`/audit/${cleanProjectId}/${audit.id}`}
                className="absolute top-3 right-3 text-tmw-coral hover:text-tmw-coral/80 transition-colors" 
                title={audit.progress > 0 ? "Poursuivre l'audit" : "Démarrer l'audit"}
              >
                <Play size={16} />
              </Link>
              
              <div className="mb-2">
                <h4 className="font-medium text-gray-800">{audit.name}</h4>
                <p className="text-xs text-gray-500">
                  Dernière mise à jour: {new Date(audit.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">Progression</span>
                    <span className="text-xs">{audit.progress || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Progress value={audit.progress || 0} className="h-2" />
                      <p className="text-xs mt-1 text-muted-foreground">
                        {audit.itemsCount 
                          ? `${Math.round((audit.progress || 0) * audit.itemsCount / 100)} / ${audit.itemsCount} critères évalués`
                          : "Aucune donnée d'évaluation"}
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
                    <Link to={`/audit/plan/${cleanProjectId}/${audit.id}`}>
                      <FileText size={12} />
                      Plan d'action
                      <Circle size={12} className="ml-1 text-red-500" />
                      <span className="text-red-500">{audit.actionsCount?.[ActionStatus.ToDo] || 0}</span>
                      <span className="mx-0.5 text-muted-foreground">|</span>
                      <Clock size={12} className="text-blue-500" />
                      <span className="text-blue-500">{audit.actionsCount?.[ActionStatus.InProgress] || 0}</span>
                      <span className="mx-0.5 text-muted-foreground">|</span>
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-green-500">{audit.actionsCount?.[ActionStatus.Done] || 0}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Aucun audit trouvé
          <div className="bg-white/70 p-4 rounded-md border border-gray-100 text-center">
            <p className="text-muted-foreground mb-3">Aucun audit pour ce projet</p>
          </div>
        )}
        
        {/* Bouton Nouvel Audit avec ID de projet clairement défini */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-white hover:bg-tmw-teal/10 border-tmw-teal/20 text-tmw-teal"
          asChild
        >
          <Link 
            to={`/audit/new/${cleanProjectId}`} 
            className="flex items-center justify-center"
            title={`Créer un nouvel audit pour le projet ${project.name} (ID: ${cleanProjectId})`}
            onClick={(e) => {
              // Vérifier que l'ID est valide avant la navigation
              if (!cleanProjectId) {
                e.preventDefault();
                console.error("Navigation empêchée : ID projet manquant ou invalide");
                alert(`Erreur : ID projet manquant ou invalide (${project.id})`);
              }
              console.log(`Navigation vers nouvel audit avec ID projet: "${cleanProjectId}"`);
            }}
          >
            <FilePlus size={16} className="mr-2" />
            Nouvel audit
          </Link>
        </Button>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
        </div>
        <div className="text-xs text-muted-foreground/60 flex items-center gap-1">
          ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{cleanProjectId}</code>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
