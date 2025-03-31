
import React, { useState, useEffect } from 'react';
import { validateAllDatabases, DatabaseValidationResult } from '@/services/notion/databaseInspector';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const DatabaseStructureValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<Record<string, DatabaseValidationResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const validationResults = await validateAllDatabases();
      setResults(validationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const countValidDatabases = () => {
    if (!results) return 0;
    return Object.values(results).filter(result => result.isValid).length;
  };

  const totalDatabases = () => {
    if (!results) return 0;
    return Object.keys(results).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Validation des bases de données</h2>
        <Button 
          onClick={handleValidate} 
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Validation en cours...
            </>
          ) : 'Valider les structures'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <>
          <Alert variant={countValidDatabases() === totalDatabases() ? "success" : "warning"}>
            <div className="flex items-center">
              {countValidDatabases() === totalDatabases() ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              <span>
                {countValidDatabases()} sur {totalDatabases()} bases de données validées
              </span>
            </div>
          </Alert>
          
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(results).map(([dbKey, result]) => (
              <AccordionItem value={dbKey} key={dbKey} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-left">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">{result.databaseName}</span>
                    <Badge variant={result.isValid ? "success" : "destructive"} className="ml-auto">
                      {result.isValid ? 'Valide' : 'Non valide'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0 pt-2">
                      {!result.isValid && (
                        <div className="space-y-2 mb-4">
                          {result.missingProperties.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Propriétés manquantes:</h4>
                              <ul className="list-disc list-inside text-sm pl-2">
                                {result.missingProperties.map((prop, i) => (
                                  <li key={i} className="text-destructive">{prop}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.incorrectTypes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Types incorrects:</h4>
                              <ul className="list-disc list-inside text-sm pl-2">
                                {result.incorrectTypes.map((error, i) => (
                                  <li key={i} className="text-amber-600">
                                    {error.property}: attendu <code>{error.expected}</code>, trouvé <code>{error.actual}</code>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {result.isValid && (
                        <p className="text-sm text-green-600">
                          Cette base de données est correctement configurée pour l'application.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}
    </div>
  );
};

export default DatabaseStructureValidator;
