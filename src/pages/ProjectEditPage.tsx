
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { notionService } from '@/services/notion/notionService';
import { useLoadingState } from '@/hooks/form';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ProjectEditPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, startLoading, stopLoading, setErrorMessage } = useLoadingState();
  
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (!projectId) return;
    
    startLoading();
    notionService.getProjectById(projectId)
      .then(response => {
        if (response.success && response.data) {
          setName(response.data.name);
          setUrl(response.data.url || '');
          setDescription(response.data.description || '');
        } else {
          setErrorMessage(response.error?.message || 'Erreur lors du chargement du projet');
        }
      })
      .catch(err => {
        setErrorMessage('Erreur lors du chargement du projet');
        console.error(err);
      })
      .finally(() => {
        stopLoading();
      });
  }, [projectId, startLoading, stopLoading, setErrorMessage]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) return;
    
    startLoading();
    
    try {
      const response = await notionService.updateProject({
        id: projectId,
        name,
        url: url || '',
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (response.success) {
        toast.success('Projet mis à jour avec succès');
        navigate(`/projects/${projectId}`);
      } else {
        setErrorMessage(response.error?.message || 'Erreur lors de la mise à jour du projet');
      }
    } catch (err) {
      setErrorMessage('Erreur lors de la mise à jour du projet');
      console.error(err);
    } finally {
      stopLoading();
    }
  };
  
  if (isLoading && !name) {
    return (
      <div className="space-y-4">
        <PageHeader 
          title="Chargement du projet..." 
        />
        <Skeleton className="h-10 mb-4" />
        <Skeleton className="h-10 mb-4" />
        <Skeleton className="h-20 mb-4" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Modifier le projet" 
        description="Mettez à jour les informations du projet"
      />
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block font-medium text-sm">
            Nom du projet
          </label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="url" className="block font-medium text-sm">
            URL du site
          </label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block font-medium text-sm">
            Description
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour le projet'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
