
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionDiagnosticReport, NotionSolutionsSection } from '@/components/notion';
import { NotionConfigForm } from '@/components/notion/form';
import { useNotion } from '@/contexts/NotionContext';

const Diagnostics = () => {
  const { usingNotion } = useNotion();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Configuration et Diagnostic Notion</h1>
      
      <Tabs defaultValue="config">
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de l'intégration Notion</CardTitle>
              <CardDescription>
                Configurez votre clé API Notion et les identifiants de base de données pour activer l'intégration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotionConfigForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="diagnostic">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic de l'intégration Notion</CardTitle>
              <CardDescription>
                Vérifiez l'état de la connexion à Notion et diagnostiquez les problèmes potentiels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotionDiagnosticReport 
                showDetails={true} 
                buttonLabel="Lancer le diagnostic complet"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="solutions">
          <Card>
            <CardHeader>
              <CardTitle>Solutions aux problèmes courants</CardTitle>
              <CardDescription>
                Utilisez ces options pour résoudre les problèmes de connexion à Notion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotionSolutionsSection 
                showApiKey={true}
                showCorsProxy={true}
                showMockMode={!usingNotion}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Diagnostics;
