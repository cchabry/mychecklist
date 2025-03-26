
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, FileText, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';

interface WriteTestButtonProps {
  databaseId: string;
  apiKey: string | null;
  label?: string;
}

// Interface pour typer les propriétés Notion
interface NotionProperty {
  type: string;
  [key: string]: any;
}

interface NotionProperties {
  [key: string]: NotionProperty;
}

interface NotionDatabase {
  id: string;
  title?: Array<{plain_text?: string}>;
  properties: NotionProperties;
  [key: string]: any;
}

const WriteTestButton: React.FC<WriteTestButtonProps> = ({ 
  databaseId, 
  apiKey, 
  label = "Tester l'écriture" 
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [details, setDetails] = useState<string | null>(null);
  const { isDemoMode, toggleMode } = useOperationModeListener();
  
  const runWriteTest = async () => {
    if (!apiKey) {
      toast.error('Clé API requise', {
        description: 'Veuillez d\'abord configurer votre clé API Notion'
      });
      return;
    }
    
    if (!databaseId) {
      toast.error('ID de base de données requis', {
        description: 'Veuillez sélectionner une base de données'
      });
      return;
    }
    
    setIsTesting(true);
    setStatus('idle');
    setDetails(null);
    
    try {
      // Forcer le mode réel pour le test (désactiver temporairement le mode démo)
      const wasInDemoMode = isDemoMode;
      if (wasInDemoMode) {
        console.log('💡 Désactivation temporaire du mode démo pour le test d\'écriture');
        toggleMode();
      }
      
      console.log(`🔍 Test d'écriture dans la base ${databaseId.substring(0, 8)}...`);
      
      // 1. Récupérer la structure de la base de données pour comprendre les propriétés requises
      console.log('1️⃣ Récupération de la structure de la base de données...');
      const dbDetails = await notionApi.databases.retrieve(databaseId, apiKey) as NotionDatabase;
      console.log('✅ Structure récupérée:', dbDetails);
      
      // Extraire le titre de la base de données
      const dbTitle = dbDetails.title?.[0]?.plain_text || databaseId;
      console.log(`📊 Base de données: "${dbTitle}"`);
      
      // Analyser les propriétés pour trouver celles requises et leurs types
      console.log('2️⃣ Analyse des propriétés de la base de données...');
      const properties = dbDetails.properties || {};
      
      // Identifier la propriété title (nécessaire pour toute page Notion)
      let titleProperty: string | null = null;
      
      for (const [name, prop] of Object.entries(properties)) {
        if (prop.type === 'title') {
          titleProperty = name;
          break;
        }
      }
      
      if (!titleProperty) {
        throw new Error('Aucune propriété de type "title" trouvée dans la base de données');
      }
      
      console.log(`🔑 Propriété titre identifiée: "${titleProperty}"`);
      
      // Construire un objet avec les propriétés minimales requises
      const timestamp = new Date().toISOString();
      const testData: any = {
        parent: { database_id: databaseId },
        properties: {
          [titleProperty]: {
            title: [
              {
                text: {
                  content: `Test d'écriture ${timestamp}`
                }
              }
            ]
          }
        }
      };
      
      // Ajouter quelques propriétés communes pour maximiser les chances de succès
      // pour les schémas courants de bases de données
      for (const [name, prop] of Object.entries(properties)) {
        if (name === titleProperty) continue; // Déjà ajouté
        
        if (prop.type === 'rich_text') {
          testData.properties[name] = {
            rich_text: [
              {
                text: {
                  content: "Texte de test"
                }
              }
            ]
          };
          console.log(`📝 Ajout de propriété rich_text: "${name}"`);
        } 
        else if (prop.type === 'select' && prop.select?.options?.length > 0) {
          testData.properties[name] = {
            select: {
              name: prop.select.options[0].name
            }
          };
          console.log(`🔽 Ajout de propriété select: "${name}" = "${prop.select.options[0].name}"`);
        }
        else if (prop.type === 'url') {
          testData.properties[name] = {
            url: "https://exemple.fr"
          };
          console.log(`🔗 Ajout de propriété url: "${name}"`);
        }
        else if (prop.type === 'number') {
          testData.properties[name] = {
            number: 42
          };
          console.log(`🔢 Ajout de propriété number: "${name}"`);
        }
        else if (prop.type === 'checkbox') {
          testData.properties[name] = {
            checkbox: false
          };
          console.log(`✓ Ajout de propriété checkbox: "${name}"`);
        }
      }
      
      console.log('3️⃣ Création d\'une page de test avec données:', testData);
      
      // Effectuer la requête de création
      const response = await notionApi.pages.create(testData, apiKey);
      
      console.log('✅ Page de test créée avec succès:', response);
      
      // Vérifier l'ID de la page créée
      const pageId = response.id;
      
      if (!pageId) {
        throw new Error('La réponse de création de page ne contient pas d\'ID');
      }
      
      console.log(`📄 Page créée avec ID: ${pageId}`);
      
      // 4. Archiver la page de test (nettoyage)
      console.log('4️⃣ Archivage de la page de test...');
      const archiveResponse = await notionApi.pages.update(pageId, {
        archived: true
      }, apiKey);
      
      console.log('✅ Page archivée:', archiveResponse);
      
      // Success
      setStatus('success');
      setDetails(`Test d'écriture réussi! Page créée et archivée dans ${dbTitle}`);
      
      toast.success('Test d\'écriture réussi', {
        description: `Une page de test a été créée et archivée dans "${dbTitle}"`
      });
      
      // Restaurer le mode démo si nécessaire
      if (wasInDemoMode) {
        console.log('🔄 Restauration du mode démo après test réussi');
        toggleMode();
      }
    } catch (error) {
      console.error('❌ Erreur lors du test d\'écriture:', error);
      
      setStatus('error');
      setDetails(`Erreur: ${error.message || 'Erreur inconnue'}`);
      
      // Message d'erreur adapté
      let errorTitle = 'Échec du test d\'écriture';
      let errorDescription = error.message;
      
      if (error.message?.includes('401')) {
        errorTitle = 'Erreur d\'authentification';
        errorDescription = 'Vérifiez que votre clé API est valide et n\'a pas expiré.';
      } else if (error.message?.includes('403')) {
        errorTitle = 'Accès refusé';
        errorDescription = 'Vérifiez que votre intégration a les permissions d\'écriture sur cette base de données.';
      } else if (error.message?.includes('404')) {
        errorTitle = 'Base de données introuvable';
        errorDescription = 'L\'ID de base de données fourni n\'existe pas ou n\'est plus accessible.';
      } else if (error.message?.includes('validation_error')) {
        errorTitle = 'Erreur de validation';
        errorDescription = 'Les données ne correspondent pas au schéma de la base. Détails: ' + error.message;
      }
      
      toast.error(errorTitle, {
        description: errorDescription
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${
              status === 'success' 
                ? 'border-green-300 text-green-700' 
                : status === 'error'
                ? 'border-red-300 text-red-700'
                : ''
            }`}
            onClick={runWriteTest}
            disabled={isTesting}
          >
            {isTesting ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : status === 'success' ? (
              <Check className="h-4 w-4" />
            ) : status === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {details || `Tester l'écriture dans la base de données sélectionnée`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WriteTestButton;
