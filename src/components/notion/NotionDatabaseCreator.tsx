
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Database, AlertCircle, Loader2 } from 'lucide-react';
import { useNotionDatabaseCreator } from '@/pages/audit/hooks/useNotionDatabaseCreator';

interface NotionDatabaseCreatorProps {
  onSuccess?: () => void;
}

const NotionDatabaseCreator: React.FC<NotionDatabaseCreatorProps> = ({ onSuccess }) => {
  const { isCreating, creationStep, createDatabases } = useNotionDatabaseCreator();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleCreateDatabases = async () => {
    setError(null);
    setSuccess(false);
    
    try {
      await createDatabases();
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la création des bases de données");
    }
  };
  
  return (
    <Card className="border-muted-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={18} />
          Création des bases de données Notion
        </CardTitle>
        <CardDescription>
          Créez les bases de données nécessaires pour myChecklist dans votre espace de travail Notion
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Succès</AlertTitle>
            <AlertDescription className="text-green-700">
              Les bases de données ont été créées avec succès dans votre espace de travail Notion.
            </AlertDescription>
          </Alert>
        )}
        
        {isCreating && (
          <div className="space-y-2">
            <Progress value={50} className="h-2" />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {creationStep || "Création en cours..."}
            </p>
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          <p>Voici ce qui sera créé :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Une base de données <strong>Projets</strong> pour stocker tous vos projets d'audit</li>
            <li>Une base de données <strong>Exigences</strong> pour stocker les critères d'évaluation</li>
            <li>Une base de données <strong>Audits</strong> pour stocker les sessions d'audit</li>
            <li>Une base de données <strong>Résultats d'audit</strong> pour stocker les évaluations individuelles</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Note : Cette opération nécessite un compte Notion avec les permissions d'écriture.
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleCreateDatabases} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Bases de données créées
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Créer les bases de données
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionDatabaseCreator;
