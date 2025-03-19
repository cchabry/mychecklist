
import { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { ProjectData } from '@/lib/notion/types';
import { Project } from '@/lib/types';
import { useNotion } from '@/contexts/NotionContext';
import { MOCK_PROJECTS } from '@/lib/mockData';

export function useNotionProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { status } = useNotion();
  
  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true);
      setError(null);
      
      try {
        if (status.isMockMode) {
          // En mode mock, utiliser les données de test
          setProjects(MOCK_PROJECTS);
          console.log('📝 Mode mock actif, utilisation des projets de test', MOCK_PROJECTS);
        } else {
          // Récupérer les projets depuis Notion
          console.log('📝 Récupération des projets depuis Notion...');
          const apiKey = localStorage.getItem('notion_api_key');
          const databaseId = localStorage.getItem('notion_database_id');
          
          if (!apiKey || !databaseId) {
            throw new Error('Configuration Notion manquante');
          }
          
          const response = await notionApi.databases.query({
            database_id: databaseId,
            sorts: [{ property: 'name', direction: 'ascending' }]
          }, apiKey);
          
          // Transformer les données Notion en projets
          const notionProjects = response.results.map((page: any): Project => {
            const propertyMap = page.properties || {};
            
            // Extraction des propriétés avec gestion des valeurs manquantes
            const nameProperty = propertyMap.name || propertyMap.Name || propertyMap.titre || propertyMap.Titre || {};
            const urlProperty = propertyMap.url || propertyMap.URL || propertyMap.site || propertyMap.Site || {};
            const progressProperty = propertyMap.progress || propertyMap.Progress || propertyMap.avancement || propertyMap.Avancement || {};
            const itemsCountProperty = propertyMap.itemsCount || propertyMap['Items Count'] || {};
            
            const name = nameProperty.title?.[0]?.plain_text || 'Sans titre';
            const url = urlProperty.url || 'https://example.com';
            const progress = progressProperty.number || 0;
            const itemsCount = itemsCountProperty.number || 0;
            
            return {
              id: page.id,
              name,
              url,
              progress,
              itemsCount,
              createdAt: page.created_time,
              updatedAt: page.last_edited_time
            };
          });
          
          console.log('✅ Projets récupérés depuis Notion:', notionProjects);
          setProjects(notionProjects);
        }
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des projets:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // En cas d'erreur, utiliser les données de test
        setProjects(MOCK_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjects();
  }, [status.isMockMode]);
  
  return { projects, isLoading, error };
}
