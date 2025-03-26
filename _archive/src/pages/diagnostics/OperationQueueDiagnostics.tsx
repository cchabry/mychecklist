
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Info, Plus, Database, RefreshCw, Clock, Hourglass } from "lucide-react";
import { useOperationQueue, RetryStrategy } from '@/hooks/api/useOperationQueue';
import OperationQueueManager from '@/components/operations/OperationQueueManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateRetryDelay } from '@/hooks/api/useServiceWithRetry';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

/**
 * Page de diagnostics pour le système de file d'attente d'opérations
 */
const OperationQueueDiagnostics: React.FC = () => {
  const { addOperation } = useOperationQueue();
  
  const [activeTab, setActiveTab] = useState('operations');
  const [entityType, setEntityType] = useState('project');
  const [operationType, setOperationType] = useState('create');
  const [entityId, setEntityId] = useState('');
  const [payloadText, setPayloadText] = useState('{\n  "name": "Test Project",\n  "description": "Test Description"\n}');
  
  // Options de retry
  const [retryStrategy, setRetryStrategy] = useState<RetryStrategy>('exponential');
  const [maxRetries, setMaxRetries] = useState(3);
  const [initialDelay, setInitialDelay] = useState(1000);
  const [backoffFactor, setBackoffFactor] = useState(2);
  const [useJitter, setUseJitter] = useState(true);
  
  // Simulation des délais
  const [simulationAttempts, setSimulationAttempts] = useState(5);
  const delaySequence = Array.from({ length: simulationAttempts }, (_, i) => 
    calculateRetryDelay(i + 1, {
      initialDelay: initialDelay,
      backoffFactor: backoffFactor,
      strategy: retryStrategy,
      useJitter: false // Désactiver jitter pour la simulation pour avoir des résultats prévisibles
    })
  );
  
  const handleAddTestOperation = () => {
    try {
      const payload = payloadText ? JSON.parse(payloadText) : undefined;
      
      addOperation(
        entityType,
        operationType as any,
        entityId || undefined,
        payload,
        {
          maxAttempts: maxRetries,
          retryStrategy: retryStrategy,
          initialDelay: initialDelay,
          backoffFactor: backoffFactor,
          useJitter: useJitter
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'opération de test:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const handleSimulateNetworkError = () => {
    try {
      // Simuler une opération qui échouera
      addOperation(
        'project',
        'create',
        undefined,
        { name: "Projet avec erreur réseau simulée", status: "draft" },
        {
          maxAttempts: maxRetries,
          retryStrategy: retryStrategy,
          initialDelay: initialDelay,
          backoffFactor: backoffFactor,
          useJitter: useJitter
        }
      );
    } catch (error) {
      console.error('Erreur lors de la simulation:', error);
    }
  };
  
  const formatDelay = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics de la File d'Attente</h1>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Système de file d'attente d'opérations</AlertTitle>
        <AlertDescription>
          Cette page permet de tester le système de file d'attente avec différentes stratégies de retry
          pour les opérations lorsque la connectivité réseau est perturbée.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="operations">Opérations de test</TabsTrigger>
          <TabsTrigger value="retry">Stratégies de retry</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une opération de test</CardTitle>
                <CardDescription>
                  Créez une opération factice pour tester le système de file d'attente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type d'entité</label>
                      <Select
                        value={entityType}
                        onValueChange={setEntityType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project">Projet</SelectItem>
                          <SelectItem value="audit">Audit</SelectItem>
                          <SelectItem value="evaluation">Évaluation</SelectItem>
                          <SelectItem value="action">Action corrective</SelectItem>
                          <SelectItem value="page">Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Type d'opération</label>
                      <Select
                        value={operationType}
                        onValueChange={setOperationType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une opération" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="create">Création</SelectItem>
                          <SelectItem value="update">Mise à jour</SelectItem>
                          <SelectItem value="delete">Suppression</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {(operationType === 'update' || operationType === 'delete') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">ID de l'entité</label>
                      <Input
                        type="text"
                        value={entityId}
                        onChange={(e) => setEntityId(e.target.value)}
                        placeholder="Entrez l'ID de l'entité"
                      />
                    </div>
                  )}
                  
                  {(operationType === 'create' || operationType === 'update') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Données (JSON)</label>
                      <Textarea
                        value={payloadText}
                        onChange={(e) => setPayloadText(e.target.value)}
                        placeholder="Entrez les données JSON"
                        className="font-mono text-sm"
                        rows={6}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Stratégie de retry</label>
                    <Select
                      value={retryStrategy}
                      onValueChange={(val) => setRetryStrategy(val as RetryStrategy)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une stratégie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immédiat</SelectItem>
                        <SelectItem value="fixed">Délai fixe</SelectItem>
                        <SelectItem value="linear">Progression linéaire</SelectItem>
                        <SelectItem value="exponential">Exponentiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre max. de tentatives</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Délai initial (ms)</label>
                      <Input
                        type="number"
                        min="100"
                        step="100"
                        value={initialDelay}
                        onChange={(e) => setInitialDelay(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  {(retryStrategy === 'exponential' || retryStrategy === 'linear') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {retryStrategy === 'exponential' ? 'Facteur multiplicateur' : 'Incrément'}
                      </label>
                      <Input
                        type="number"
                        min="1.1"
                        step="0.1"
                        value={backoffFactor}
                        onChange={(e) => setBackoffFactor(parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useJitter"
                      checked={useJitter}
                      onChange={(e) => setUseJitter(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="useJitter" className="text-sm">
                      Ajouter une variation aléatoire (jitter) pour éviter les tempêtes de requêtes
                    </label>
                  </div>
                  
                  <Button onClick={handleAddTestOperation} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter l'opération de test
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tester les scénarios d'erreur</CardTitle>
                <CardDescription>
                  Simulez différents types d'erreurs et observez le comportement de retry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Tests automatisés</AlertTitle>
                    <AlertDescription>
                      Les boutons ci-dessous permettent de simuler différents types d'erreurs
                      et d'observer comment le système de file d'attente les gère.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleSimulateNetworkError}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Simuler une erreur réseau
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        // Ajouter plusieurs opérations pour tester le traitement par lots
                        for (let i = 1; i <= 3; i++) {
                          addOperation(
                            'audit',
                            'create',
                            undefined,
                            { name: `Audit de test ${i}`, status: "En cours" },
                            {
                              maxAttempts: maxRetries,
                              retryStrategy: retryStrategy,
                              initialDelay: initialDelay,
                              backoffFactor: backoffFactor,
                              useJitter: useJitter
                            }
                          );
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Ajouter 3 opérations pour test de traitement par lots
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        // Une opération qui va échouer définitivement (1 seule tentative)
                        addOperation(
                          'evaluation',
                          'update',
                          'eval-test-999',
                          { score: "Non conforme" },
                          {
                            maxAttempts: 1,
                            retryStrategy: 'immediate',
                            initialDelay: 0
                          }
                        );
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Simuler une opération avec échec définitif
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="retry">
          <Card>
            <CardHeader>
              <CardTitle>Simulation des stratégies de retry</CardTitle>
              <CardDescription>
                Visualisez comment les délais évoluent selon la stratégie choisie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Stratégie de retry</h3>
                    <RadioGroup 
                      value={retryStrategy} 
                      onValueChange={(val) => setRetryStrategy(val as RetryStrategy)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immediate" id="immediate" />
                        <Label htmlFor="immediate">Immédiat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Délai fixe</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="linear" id="linear" />
                        <Label htmlFor="linear">Progression linéaire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exponential" id="exponential" />
                        <Label htmlFor="exponential">Exponentiel (backoff)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Délai initial (ms)</label>
                      <Input
                        type="number"
                        min="100"
                        step="100"
                        value={initialDelay}
                        onChange={(e) => setInitialDelay(parseInt(e.target.value))}
                      />
                    </div>
                    
                    {(retryStrategy === 'exponential' || retryStrategy === 'linear') && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {retryStrategy === 'exponential' ? 'Facteur' : 'Incrément'}
                        </label>
                        <Input
                          type="number"
                          min="1.1"
                          step="0.1"
                          value={backoffFactor}
                          onChange={(e) => setBackoffFactor(parseFloat(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nombre de tentatives à simuler
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={simulationAttempts}
                      onChange={(e) => setSimulationAttempts(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Séquence de délais</h3>
                  <div className="bg-slate-50 p-3 rounded border space-y-2">
                    {delaySequence.map((delay, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="text-sm flex items-center">
                          <Hourglass className="h-3 w-3 mr-2 text-slate-500" />
                          Tentative {index + 1}:
                        </div>
                        <div className="font-mono text-sm">
                          {formatDelay(delay)}
                        </div>
                      </div>
                    ))}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Délai total:</span>
                      <span className="font-mono">
                        {formatDelay(delaySequence.reduce((sum, delay) => sum + delay, 0))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Alert className="bg-blue-50 text-blue-800">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {retryStrategy === 'immediate' && 
                          "Cette stratégie retente immédiatement sans attendre. Utile pour les erreurs temporaires très brèves, mais peut surcharger le serveur."}
                        {retryStrategy === 'fixed' && 
                          "Cette stratégie utilise toujours le même délai entre les tentatives. Simple mais ne s'adapte pas à des problèmes persistants."}
                        {retryStrategy === 'linear' && 
                          "Cette stratégie augmente le délai de façon linéaire, ce qui permet d'espacer progressivement les tentatives."}
                        {retryStrategy === 'exponential' && 
                          "Cette stratégie augmente le délai de façon exponentielle, permettant d'espacer rapidement les tentatives en cas de problème persistant."}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring">
          <OperationQueueManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationQueueDiagnostics;
