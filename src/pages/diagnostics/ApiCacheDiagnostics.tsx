
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Database, Info, RefreshCw, Trash2 } from "lucide-react";
import { useProjects } from "@/hooks/api";
import { useActionsByAudit, useActionsByEvaluation } from "@/hooks/api/useActions";
import { useEvaluationsByAudit } from "@/hooks/api/useEvaluations";

const ServiceTest = ({ title, useHook, params = [], renderData = (data: any) => JSON.stringify(data, null, 2) }) => {
  const [refresh, setRefresh] = useState(0);
  const { data, isLoading, error, refetch } = useHook(...params, { key: `test-${refresh}` });

  return (
    <div className="mb-4 p-4 border rounded-md">
      <div className="flex justify-between mb-3">
        <h3 className="font-medium">{title}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { 
            setRefresh(prev => prev + 1);
            refetch();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Recharger
        </Button>
      </div>
      
      {isLoading && <p className="text-gray-500">Chargement en cours...</p>}
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !error && data && (
        <div className="mt-2">
          <p className="mb-1 text-sm text-gray-500">Données récupérées:</p>
          <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-auto max-h-40">
            {Array.isArray(data) ? (
              <div>
                <Badge>{data.length} élément(s)</Badge>
                <pre>{renderData(data)}</pre>
              </div>
            ) : (
              <pre>{renderData(data)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Page de diagnostics pour tester les services API avec cache
 */
const ApiCacheDiagnostics: React.FC = () => {
  const [testAuditId, setTestAuditId] = useState<string>("test-audit-id");
  const [testEvaluationId, setTestEvaluationId] = useState<string>("test-evaluation-id");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics API avec Cache</h1>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Tests des hooks API avec cache</AlertTitle>
        <AlertDescription>
          Cette page permet de tester les hooks qui interagissent avec l'API 
          et utilisent le système de cache. Les données sont mises en cache 
          selon les règles définies pour chaque service.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de test</CardTitle>
            <CardDescription>Identifiants utilisés pour les tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID d'audit de test</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testAuditId}
                    onChange={(e) => setTestAuditId(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ID d'évaluation de test</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testEvaluationId}
                    onChange={(e) => setTestEvaluationId(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Actions de diagnostic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le cache et recharger
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test des services avec cache</CardTitle>
          <CardDescription>
            Chaque service est appelé avec le système de cache. 
            Le temps de chargement devrait être plus rapide après le premier appel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceTest 
            title="Projets" 
            useHook={useProjects} 
            renderData={(data) => 
              Array.isArray(data) 
                ? `[${data.length} projets]` 
                : JSON.stringify(data, null, 2)
            }
          />
          
          <ServiceTest 
            title="Évaluations par audit" 
            useHook={useEvaluationsByAudit}
            params={[testAuditId]}
            renderData={(data) => 
              Array.isArray(data) 
                ? `[${data.length} évaluations]` 
                : JSON.stringify(data, null, 2)
            }
          />
          
          <ServiceTest 
            title="Actions par audit" 
            useHook={useActionsByAudit}
            params={[testAuditId]}
            renderData={(data) => 
              Array.isArray(data) 
                ? `[${data.length} actions]` 
                : JSON.stringify(data, null, 2)
            }
          />
          
          <ServiceTest 
            title="Actions par évaluation" 
            useHook={useActionsByEvaluation}
            params={[testEvaluationId]}
            renderData={(data) => 
              Array.isArray(data) 
                ? `[${data.length} actions]` 
                : JSON.stringify(data, null, 2)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiCacheDiagnostics;
