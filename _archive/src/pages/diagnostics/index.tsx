
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotionDeploymentChecker from '@/components/notion/NotionDeploymentChecker';
import DeploymentDebugger from '@/components/notion/DeploymentDebugger';
import { operationMode } from '@/services/operationMode';
import OperationModeDiagnostics from './OperationModeDiagnostics';
import NotionDiagnostics from './NotionDiagnostics';
import CorsProxyDiagnostics from './CorsProxyDiagnostics';

const DiagnosticsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Diagnostics système</h1>
          <p className="text-gray-500">
            Outils de diagnostic et de dépannage pour l'application
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DeploymentDebugger />
          <NotionDeploymentChecker />
        </div>
        
        <Tabs defaultValue="notion" className="mt-6">
          <TabsList>
            <TabsTrigger value="notion">Notion API</TabsTrigger>
            <TabsTrigger value="operationMode">Operation Mode</TabsTrigger>
            <TabsTrigger value="corsProxy">CORS Proxy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notion" className="space-y-4 mt-4">
            <NotionDiagnostics />
          </TabsContent>
          
          <TabsContent value="operationMode" className="space-y-4 mt-4">
            <OperationModeDiagnostics />
            
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => operationMode.enableRealMode()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Activer le mode réel
                  </button>
                  
                  <button 
                    onClick={() => operationMode.enableDemoMode('Action manuelle')}
                    className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                  >
                    Activer le mode démo
                  </button>
                  
                  <button 
                    onClick={() => operationMode.reset()}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Réinitialiser
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="corsProxy" className="space-y-4 mt-4">
            <CorsProxyDiagnostics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DiagnosticsPage;
