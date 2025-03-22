import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2, AlertTriangle, CheckCircle, XCircle, Copy } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { isMockActive, temporarilyDisableMock, enableMock } from '@/lib/notionProxy/mock/utils';

interface NotionDatabaseStructureCheckProps {
  onSuccess?: () => void;
}

const NotionDatabaseStructureCheck: React.FC<NotionDatabaseStructureCheckProps> = ({ onSuccess }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [databaseStructure, setDatabaseStructure] = useState<{
    id: string;
    title: string;
    properties: Record<string, any>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const checkDatabaseStructure = async () => {
    setIsChecking(true);
    setError(null);
    setDatabaseStructure(null);
    setRecommendations([]);

    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');

    if (!apiKey || !dbId) {
      setError('Configuration Notion incomplète. Veuillez configurer votre clé API et l\'ID de base de données.');
      setIsChecking(false);
      return;
    }

    const wasMockMode = isMockActive();
    if (wasMockMode) {
      console.log('🔍 Désactivation temporaire du mode mock pour l\'analyse de structure');
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      temporarilyDisableMock();
    }

    try {
      try {
        await notionApi.users.me(apiKey);
        console.log('✅ Authentification vérifiée');
      } catch (authError) {
        setError('Erreur d\'authentification Notion. Veuillez vérifier votre clé API.');
        setIsChecking(false);
        return;
      }

      try {
        const dbInfo = await notionApi.databases.retrieve(dbId, apiKey);
        
        if (dbInfo && dbInfo.properties) {
          console.log('✅ Structure de la base récupérée:', dbInfo);
          
          setDatabaseStructure({
            id: dbInfo.id,
            title: dbInfo.title?.[0]?.plain_text || 'Base sans titre',
            properties: dbInfo.properties
          });
          
          const propertyRecommendations: string[] = [];
          
          const hasTitle = Object.entries(dbInfo.properties).some(
            ([name, prop]) => (prop as any).type === 'title'
          );
          
          if (!hasTitle) {
            propertyRecommendations.push('Aucune propriété de type "title" trouvée. Ajoutez une propriété "Name" ou "Titre" de type "Title".');
          }
          
          const hasStatus = Object.entries(dbInfo.properties).some(
            ([name, prop]) => (
              (name === 'Status' || name === 'Statut') && 
              (prop as any).type === 'select'
            )
          );
          
          if (!hasStatus) {
            propertyRecommendations.push('Aucune propriété "Status" ou "Statut" de type "Select" trouvée. Cela peut causer des erreurs lors de la création.');
          }
          
          const hasTitleWithCorrectName = Object.entries(dbInfo.properties).some(
            ([name, prop]) => (
              (name === 'Name' || name === 'Nom' || name === 'Titre' || name === 'Title') && 
              (prop as any).type === 'title'
            )
          );
          
          if (!hasTitleWithCorrectName) {
            propertyRecommendations.push('La propriété de titre ne s\'appelle pas "Name", "Nom", "Titre" ou "Title". Cela pourrait causer des problèmes.');
          }
          
          setRecommendations(propertyRecommendations);
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError('Impossible de récupérer les détails de la base de données. Réponse invalide.');
        }
      } catch (dbError) {
        console.error('❌ Erreur lors de la récupération de la structure:', dbError);
        
        let errorMessage = 'Erreur lors de la récupération de la structure de la base de données.';
        
        if (dbError.message?.includes('404')) {
          errorMessage = 'Base de données introuvable. Vérifiez l\'ID et les permissions.';
        } else if (dbError.message?.includes('403')) {
          errorMessage = 'Accès refusé. Votre intégration n\'a pas accès à cette base de données.';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Erreur globale:', error);
      setError('Une erreur inattendue est survenue. Vérifiez la console pour plus de détails.');
    } finally {
      setIsChecking(false);
      
      if (wasMockMode) {
        console.log('🔍 Restauration du mode mock après l\'analyse');
        enableMock();
      }
    }
  };

  const copyStructureToClipboard = () => {
    if (!databaseStructure) return;
    
    try {
      const formattedStructure = Object.entries(databaseStructure.properties)
        .map(([name, prop]) => `${name} (${(prop as any).type})`)
        .join('\n');
      
      navigator.clipboard.writeText(formattedStructure);
      toast.success('Structure copiée', {
        description: 'La structure de la base a été copiée dans le presse-papier.'
      });
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast.error('Échec de la copie', {
        description: 'Impossible de copier la structure de la base.'
      });
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-blue-200 shadow-sm">
      <CardHeader className="bg-blue-50/50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-blue-500" />
            <CardTitle className="text-lg text-blue-800">Structure de la base de données</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diagnostic</Badge>
        </div>
        <CardDescription className="text-blue-700">
          Analyse la structure de votre base de données Notion pour vérifier sa compatibilité avec l'application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Erreur</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {databaseStructure && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <Database size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-800">Base: {databaseStructure.title}</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={copyStructureToClipboard}
                  >
                    <Copy size={14} className="text-blue-500" />
                  </Button>
                </div>
                <p className="text-blue-700 mt-1">ID: {databaseStructure.id}</p>
                
                <div className="mt-3">
                  <h4 className="text-blue-800 font-medium mb-2">Liste des propriétés:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(databaseStructure.properties).map(([name, prop]) => (
                      <div key={name} className="bg-white/50 px-2 py-1 rounded border border-blue-100 text-xs">
                        <span className="font-medium">{name}</span>{' '}
                        <span className="text-blue-500">({(prop as any).type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800">Recommandations</h3>
                <ul className="text-amber-700 mt-1 space-y-1 list-disc pl-4">
                  {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {!databaseStructure && !error && !isChecking && (
          <div className="text-center py-4">
            <Database size={40} className="mx-auto text-blue-300 mb-3" />
            <p className="text-sm text-muted-foreground">
              Cliquez sur le bouton ci-dessous pour analyser la structure de votre base de données Notion
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-blue-50/50 border-t border-blue-100 px-4 py-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDatabaseStructure(null);
            setError(null);
            setRecommendations([]);
          }}
          className="text-blue-700 border-blue-300 hover:bg-blue-100"
          disabled={isChecking || (!databaseStructure && !error)}
        >
          <XCircle size={14} className="mr-1.5" />
          Effacer
        </Button>
        
        <Button
          onClick={checkDatabaseStructure}
          disabled={isChecking}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          {isChecking ? (
            <>
              <Loader2 size={14} className="mr-1.5 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <CheckCircle size={14} className="mr-1.5" />
              Analyser la structure
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionDatabaseStructureCheck;
