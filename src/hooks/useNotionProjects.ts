
import { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { ProjectData } from '@/lib/notion/types';
import { Project } from '@/lib/types';
import { useNotion } from '@/contexts/NotionContext';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { toast } from 'sonner';

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
          
          // Vérifier avant tout si l'utilisateur est authentifié
          try {
            const userResponse = await notionApi.users.me(apiKey);
            console.log('✅ Utilisateur authentifié:', userResponse.name || userResponse.id);
          } catch (authError) {
            console.error('❌ Erreur d\'authentification:', authError);
            throw new Error('Erreur d\'authentification avec l\'API Notion. Vérifiez votre clé API.');
          }
          
          // Test d'autorisation préalable pour un meilleur diagnostic
          try {
            const dbInfo = await notionApi.databases.retrieve(databaseId, apiKey);
            console.log('✅ Base de données accessible:', dbInfo.title?.[0]?.plain_text || databaseId);
          } catch (dbError) {
            console.error('❌ Erreur d\'accès à la base de données:', dbError);
            if (dbError.message?.includes('403')) {
              throw new Error('Votre intégration Notion n\'a pas accès à cette ressource. Vérifiez que l\'intégration est bien partagée avec votre base de données.');
            } else {
              throw dbError; // Propager l'erreur pour un meilleur diagnostic
            }
          }
          
          // Exécuter la requête pour récupérer les projets
          const response = await notionApi.databases.query(
            databaseId,
            { sorts: [{ property: 'name', direction: 'ascending' }] },
            apiKey
          );
          
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
        
        // Afficher un toast pour l'erreur
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        if (errorMessage.includes('accès') || errorMessage.includes('403')) {
          toast.error("Erreur d'autorisation Notion", {
            description: "Votre intégration n'a pas accès à la base de données. Vérifiez les permissions dans Notion.",
            duration: 6000
          });
        } else if (errorMessage.includes('authentification') || errorMessage.includes('401')) {
          toast.error("Erreur d'authentification Notion", {
            description: "Vérifiez votre clé d'API Notion dans les paramètres.",
            duration: 6000
          });
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
          toast.error("Erreur de connexion", {
            description: "Impossible de se connecter à l'API Notion. Vérifiez votre connexion internet.",
            duration: 6000
          });
        } else {
          toast.error("Erreur avec Notion", {
            description: errorMessage.substring(0, 100),
            duration: 6000
          });
        }
        
        // En cas d'erreur, utiliser les données de test
        setProjects(MOCK_PROJECTS);
        
        // Activer automatiquement le mode mock pour améliorer l'expérience utilisateur
        if (!status.isMockMode) {
          notionApi.mockMode.activate();
          toast.info('Mode démonstration activé', {
            description: 'Les données de test sont affichées en attendant la résolution du problème.',
            duration: 5000
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjects();
  }, [status.isMockMode]);
  
  return { projects, isLoading, error };
}
