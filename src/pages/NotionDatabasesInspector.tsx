
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DatabaseStructureValidator from '@/components/notion/DatabaseStructureValidator';

const NotionDatabasesInspector: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inspecteur des bases de données Notion</CardTitle>
            <CardDescription>
              Validez et inspectez les structures des bases de données Notion utilisées par l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Cet outil vous permet de vérifier que vos bases de données Notion sont correctement configurées
              pour fonctionner avec l'application. Il identifie les propriétés manquantes ou incorrectes.
            </p>
          </CardContent>
        </Card>
        
        <DatabaseStructureValidator />
      </main>
    </div>
  );
};

export default NotionDatabasesInspector;
