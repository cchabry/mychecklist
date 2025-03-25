
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Database, CheckCircle, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { validateAllDatabases, DatabaseValidationResult } from '@/services/notion/databaseInspector';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';

const DatabaseResultItem: React.FC<{ result: DatabaseValidationResult }> = ({ result }) => {
  return (
    <AccordionItem value={result.databaseId}>
      <AccordionTrigger className="flex gap-2">
        <div className="flex items-center gap-2">
          {result.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          <span>{result.databaseName}</span>
          <Badge variant={result.isValid ? "success" : "destructive"} className="ml-2">
            {result.isValid ? "Valide" : "À corriger"}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {result.missingProperties.length > 0 && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Propriétés manquantes</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {result.missingProperties.map(prop => (
                  <li key={prop}>{prop}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {result.incorrectTypes.length > 0 && (
          <Alert variant="warning" className="mb-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Types incorrects</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {result.incorrectTypes.map(({ property, expected, actual }) => (
                  <li key={property}>
                    <strong>{property}</strong>: trouvé <code>{actual}</code>, attendu <code>{expected}</code>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {result.isValid && (
          <Alert variant="success" className="mb-3">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Structure valide</AlertTitle>
            <AlertDescription>
              Toutes les propriétés requises sont présentes avec les bons types.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Structure détaillée:</h4>
          <ScrollArea className="h-64 rounded-md border p-4">
            <pre className="text-xs text-wrap overflow-auto">
              {JSON.stringify(result.fullStructure, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const DatabaseStructureValidator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, DatabaseValidationResult> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const runValidation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Désactiver temporairement le mode démo si actif
      const wasDemoMode = operationMode.isDemoMode;
      if (wasDemoMode) {
        operationMode.temporarilyForceReal();
      }
      
      const validationResults = await validateAllDatabases();
      setResults(validationResults);
      
      // Compter les bases de données invalides
      const invalidCount = Object.values(validationResults).filter(r => !r.isValid).length;
      if (invalidCount > 0) {
        toast.warning(`${invalidCount} base(s) de données à corriger`, {
          description: "Certaines bases de données nécessitent des corrections."
        });
      } else {
        toast.success("Toutes les bases de données sont correctement configurées");
      }
      
      // Restaurer le mode démo si nécessaire
      if (wasDemoMode) {
        setTimeout(() => {
          operationMode.enableDemoMode("Mode démo réactivé après vérification des structures");
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error("Erreur lors de la validation", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const validDatabasesCount = results 
    ? Object.values(results).filter(r => r.isValid).length 
    : 0;
  
  const totalDatabasesCount = results 
    ? Object.keys(results).length 
    : 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Validation des structures de bases de données Notion
        </CardTitle>
        <CardDescription>
          Vérifie que les bases de données Notion sont correctement configurées pour l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Résultats de la validation</h3>
              <Badge variant="outline">
                {validDatabasesCount}/{totalDatabasesCount} valides
              </Badge>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {Object.values(results).map(result => (
                <DatabaseResultItem key={result.databaseId} result={result} />
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button 
          variant="default" 
          onClick={runValidation} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validation en cours...
            </>
          ) : (
            <>
              Vérifier les structures
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseStructureValidator;
