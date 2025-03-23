
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Info, Plus, Database, RefreshCw } from "lucide-react";
import { useOperationQueue } from '@/hooks/api/useOperationQueue';
import OperationQueueManager from '@/components/operations/OperationQueueManager';

/**
 * Page de diagnostics pour le système de file d'attente d'opérations
 */
const OperationQueueDiagnostics: React.FC = () => {
  const { addOperation } = useOperationQueue();
  
  const [entityType, setEntityType] = useState('project');
  const [operationType, setOperationType] = useState('create');
  const [entityId, setEntityId] = useState('');
  const [payloadText, setPayloadText] = useState('{\n  "name": "Test Project",\n  "description": "Test Description"\n}');
  
  const handleAddTestOperation = () => {
    try {
      const payload = payloadText ? JSON.parse(payloadText) : undefined;
      
      addOperation(
        entityType,
        operationType as any,
        entityId || undefined,
        payload
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'opération de test:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics de la File d'Attente</h1>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Système de file d'attente d'opérations</AlertTitle>
        <AlertDescription>
          Cette page permet de tester le système de file d'attente qui stocke et traite
          les opérations en attente lorsque la connectivité réseau est perturbée.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              
              <Button onClick={handleAddTestOperation} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter l'opération de test
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tester les opérations avec le serviceWithRetry</CardTitle>
            <CardDescription>
              Simulez des appels de service avec le système de file d'attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Simulation d'échec</AlertTitle>
                <AlertDescription>
                  Ces opérations échoueront délibérément mais seront ajoutées à la file d'attente.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Simuler un échec et ajouter à la file d'attente
                    addOperation(
                      'project',
                      'create',
                      undefined,
                      { name: "Projet depuis simulation d'échec", status: "draft" }
                    );
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Simuler un échec de création de projet
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Simuler un échec et ajouter à la file d'attente
                    addOperation(
                      'audit',
                      'update',
                      'audit-123',
                      { name: "Audit mis à jour", status: "completed" }
                    );
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Simuler un échec de mise à jour d'audit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <OperationQueueManager />
    </div>
  );
};

export default OperationQueueDiagnostics;
