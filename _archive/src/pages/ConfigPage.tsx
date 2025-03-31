
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database, Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import OperationModeControl from '@/components/OperationModeControl';
import OperationModeSettings from '@/components/OperationModeSettings';
import { operationMode } from '@/services/operationMode';
import { useOperationMode } from '@/services/operationMode';
import { Link } from 'react-router-dom';
import { NotionConfig } from '@/components/notion/config';

/**
 * Page de configuration de l'application
 */
const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('operation-mode');
  const { isDemoMode, failures } = useOperationMode();
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Configuration</h1>
      </div>
      
      {isDemoMode && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Mode démonstration actif</AlertTitle>
          <AlertDescription className="text-blue-600">
            L'application est actuellement en mode démonstration. Les données affichées sont simulées.
          </AlertDescription>
        </Alert>
      )}
      
      {failures > 0 && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Problèmes de connexion détectés</AlertTitle>
          <AlertDescription className="text-amber-600">
            {failures} tentative{failures > 1 ? 's' : ''} de connexion a échoué récemment.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="operation-mode">
            {isDemoMode ? (
              <Database className="h-4 w-4 mr-2" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Mode opérationnel
          </TabsTrigger>
          <TabsTrigger value="notion">Notion</TabsTrigger>
          <TabsTrigger value="avancees">Paramètres avancés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operation-mode" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <OperationModeControl />
            
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du mode opérationnel</CardTitle>
                <CardDescription>
                  Configurez le comportement du système de modes opérationnels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperationModeSettings />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Outils de diagnostic</CardTitle>
              <CardDescription>
                Outils pour tester et diagnostiquer les problèmes de connexion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex items-start"
                  asChild
                >
                  <Link to="/diagnostics/operation-mode">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">Diagnostics du mode opérationnel</span>
                      <span className="text-xs text-gray-500 mt-1">
                        Tester le système de gestion des modes
                      </span>
                    </div>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex items-start"
                  asChild
                >
                  <Link to="/diagnostics/notion">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">Diagnostics Notion</span>
                      <span className="text-xs text-gray-500 mt-1">
                        Tester la connexion à l'API Notion
                      </span>
                    </div>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex items-start"
                  onClick={() => {
                    operationMode.reset();
                    window.location.reload();
                  }}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">Réinitialiser l'état</span>
                    <span className="text-xs text-gray-500 mt-1">
                      Effacer toutes les erreurs et réinitialiser les paramètres
                    </span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notion">
          <NotionConfig />
        </TabsContent>
        
        <TabsContent value="avancees">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
              <CardDescription>
                Options avancées pour les utilisateurs expérimentés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Contenu à venir...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigPage;
