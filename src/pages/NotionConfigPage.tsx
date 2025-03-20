
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionConfig, NotionProxyConfigSection } from '@/components/notion';
import NotionDocLink from '@/components/NotionDocLink';
import MainMenu from '@/components/MainMenu';

const NotionConfigPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <MainMenu />
      
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Configuration Notion</h1>
        <NotionDocLink />
      </div>
      
      <Tabs defaultValue="config">
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="proxy">Proxy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de l'API Notion</CardTitle>
              <CardDescription>
                Configurez les paramètres de connexion à l'API Notion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotionConfig />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="proxy">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du proxy Notion</CardTitle>
              <CardDescription>
                Paramètres avancés pour le proxy de l'API Notion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotionProxyConfigSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Liens et ressources</CardTitle>
          <CardDescription>
            Documentation et outils pour configurer Notion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Documentation</h3>
              <p className="mb-2">
                Consultez notre guide détaillé pour configurer vos bases de données Notion:
              </p>
              <NotionDocLink />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Notion API</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <a 
                    href="https://developers.notion.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Documentation officielle de l'API Notion
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.notion.so/my-integrations" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Gérer vos intégrations Notion
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotionConfigPage;
