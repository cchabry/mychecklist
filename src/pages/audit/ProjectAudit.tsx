
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { cleanProjectId } from '@/lib/utils';

import Header from '@/components/Header';
import AuditNotFound from './components/AuditNotFound';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectAudit: React.FC = () => {
  const { projectId, auditId } = useParams<{ projectId: string; auditId?: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any | null>(null);
  const [audit, setAudit] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cleanedProjectId = cleanProjectId(projectId);

  useEffect(() => {
    const loadData = async () => {
      if (!cleanedProjectId) {
        setError("ID de projet invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Chargement du projet
        const projectData = await notionApi.getProject(cleanedProjectId);
        if (!projectData) {
          setError("Projet non trouvé");
          return;
        }
        setProject(projectData);
        
        // Si un auditId est fourni, chargement de l'audit
        if (auditId) {
          try {
            const auditData = await notionApi.getAudit(auditId);
            if (!auditData) {
              setError("Audit non trouvé");
              return;
            }
            setAudit(auditData);
          } catch (auditErr: any) {
            console.error(`Erreur lors du chargement de l'audit ${auditId}:`, auditErr);
            setError(auditErr.message || "Impossible de charger l'audit");
          }
        }
        
        setError(null);
      } catch (err: any) {
        console.error(`Erreur lors du chargement du projet ${cleanedProjectId}:`, err);
        setError(err.message || "Impossible de charger le projet");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cleanedProjectId, auditId]);

  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Card className="max-w-4xl mx-auto animate-pulse">
            <CardContent className="p-6 h-96"></CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Si une erreur s'est produite ou si le projet n'a pas été trouvé
  if (error || !project) {
    return <AuditNotFound navigate={navigate} projectId={projectId} error={error || undefined} />;
  }

  // Interface d'audit (à implémenter selon les besoins)
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{audit ? `Audit: ${audit.name}` : 'Nouvel audit'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Projet: {project.name}</h2>
              {project.url && (
                <p className="text-muted-foreground">
                  URL: <a href={project.url} target="_blank" rel="noopener noreferrer">{project.url}</a>
                </p>
              )}
            </div>
            
            {/* Contenu de l'interface d'audit à implémenter */}
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-center text-muted-foreground">
                Interface d'audit en cours de développement
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProjectAudit;
