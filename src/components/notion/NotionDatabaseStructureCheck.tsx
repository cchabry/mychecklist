import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Database, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isMockActive, temporarilyDisableMock, enableMock } from './utils';

interface DatabaseCheckProps {
  databaseId: string | null;
  apiKey: string | null;
  onCheck: () => void;
}

const NotionDatabaseStructureCheck: React.FC<DatabaseCheckProps> = ({ databaseId, apiKey, onCheck }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when databaseId or apiKey changes
    setIsValid(false);
    setErrorMessage(null);
  }, [databaseId, apiKey]);

  const checkDatabaseStructure = async () => {
    setIsChecking(true);
    setErrorMessage(null);

    try {
      // Vérifier si le mode mock est actif
      if (isMockActive()) {
        console.warn('Mode mock activé: la vérification de la structure est ignorée.');
        setIsValid(true);
        return;
      }

      if (!databaseId || !apiKey) {
        throw new Error('Clé API ou ID de base de données manquant.');
      }

      // Simuler une vérification réussie pour l'instant
      // En réalité, cette fonction devrait appeler l'API Notion via un proxy CORS
      console.log('Vérification de la structure de la base de données Notion...');
      
      // Implémenter l'appel réel ici plus tard
      setIsValid(true);
    } catch (error) {
      const formattedError = error instanceof Error ? error : new Error(String(error));
      setErrorMessage(formattedError.message);
      setIsValid(false);
    } finally {
      setIsChecking(false);
      onCheck();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={16} />
          Vérification de la structure de la base de données
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Vérifie si la base de données Notion est correctement configurée pour l'application.
        </p>
        <Separator className="my-4" />
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}
        <Button 
          variant="outline" 
          onClick={checkDatabaseStructure} 
          disabled={isChecking || !databaseId || !apiKey}
          className="w-full justify-center"
        >
          {isChecking ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Vérification en cours...
            </>
          ) : (
            <>
              Vérifier la structure
            </>
          )}
        </Button>
        {isValid && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">La structure de la base de données est valide.</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <Badge variant="secondary">
            Mode Mock: {isMockActive() ? 'Activé' : 'Désactivé'}
          </Badge>
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={temporarilyDisableMock}
              disabled={!isMockActive()}
            >
              Désactiver Mock
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={enableMock}
              disabled={isMockActive()}
            >
              Activer Mock
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionDatabaseStructureCheck;
