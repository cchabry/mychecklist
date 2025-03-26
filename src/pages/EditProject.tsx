import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsService } from '@/lib/notion/projectsService';
import { useOperationMode } from '@/services/operationMode';
import { operationMode } from '@/services/operationMode';

const EditProject: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const { isDemoMode, enableRealMode, enableDemoMode } = useOperationMode();

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const wasDemoMode = operationMode.isDemoMode;
      if (wasDemoMode) {
        operationMode.enableRealMode();
      }

      const projectData = await notionApi.projects.get(projectId);
      
      // Restaurer le mode démo si nécessaire
      if (wasDemoMode) {
        operationMode.enableDemoMode('Retour après chargement');
      }

      if (projectData) {
        setProject(projectData);
        setName(projectData.name || '');
        setDescription(projectData.description || '');
        setUrl(projectData.url || '');
        setIsLoading(false);
      } else {
        setError('Project not found');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error loading project:', error);
      setError(error.message || 'Failed to load project');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!projectId) throw new Error('Project ID is missing');

      const updatedProject = {
        name,
        description,
        url,
      };

      // Utiliser le service pour mettre à jour le projet
      await projectsService.updateProject(projectId, updatedProject);

      toast.success('Project updated successfully');
      router.push('/'); // Redirect to home after save
    } catch (error) {
      console.error('❌ Error updating project:', error);
      setError(error.message || 'Failed to update project');
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProject;
