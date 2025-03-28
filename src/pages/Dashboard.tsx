
import React from 'react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { Card } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectStatus } from '@/types/enums';
import { PageHeader } from '@/components/layout';
import { Project } from '@/types/domain';

export default function Dashboard() {
  const { projects, isLoading, error, isDemoMode } = useProjects();
  const navigate = useNavigate();

  if (isLoading) return <div>Chargement des projets...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  // Filtrer les projets par statut
  const completedProjects = projects.filter(
    (project: Project) => project.status === ProjectStatus.COMPLETED
  );

  const activeProjects = projects.filter(
    (project: Project) => project.status === ProjectStatus.ACTIVE
  );

  const pendingProjects = projects.filter(
    (project: Project) => project.status === ProjectStatus.PENDING
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de vos projets d'audit"
        actions={
          <Button asChild>
            <Link to="/projects/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau projet
            </Link>
          </Button>
        }
      />

      {isDemoMode && (
        <Card className="bg-amber-50 border-amber-200 p-4">
          <p className="text-amber-800">
            Vous êtes en mode démonstration. Les données affichées sont simulées.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project: Project) => (
          <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-500 mb-2 text-sm truncate">
                  {project.url}
                </p>
                <p className="text-sm line-clamp-2 mb-3">{project.description}</p>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => navigate(`/projects/${project.id}/audits`)}
                >
                  Audits
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Détails
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
