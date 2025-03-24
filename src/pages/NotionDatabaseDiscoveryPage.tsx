
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotionDatabaseDiscovery } from '@/components/notion';
import { useNotion } from '@/contexts/NotionContext';

const NotionDatabaseDiscoveryPage: React.FC = () => {
  const { config, status } = useNotion();

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight text-tmw-darkgray">
          Découverte des bases de données Notion
        </h1>
        <p className="text-muted-foreground mt-2">
          Recherchez et explorez toutes les bases de données accessibles avec votre clé API Notion
        </p>
      </div>
      
      {!status.isConnected && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Non connecté à Notion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              Pour accéder à cette fonctionnalité, vous devez d'abord configurer votre API Notion.
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Aller à la configuration
            </Button>
          </CardContent>
        </Card>
      )}
      
      <NotionDatabaseDiscovery />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Utilisation</CardTitle>
          <CardDescription>Comment utiliser les identifiants de base de données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              Les identifiants de base de données Notion sont nécessaires pour configurer l'application 
              et permettre l'accès aux différentes données de votre espace de travail.
            </p>
            <div className="bg-slate-50 p-3 rounded-md border text-sm">
              <h3 className="font-medium mb-1">Configuration requise</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Base de données principale des projets</li>
                <li>Base de données des checklists (référentiel)</li>
                <li>Autres bases de données selon les fonctionnalités</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Utilisez le bouton "Copier ID" pour copier facilement l'identifiant d'une base de données,
              puis collez-le dans les champs de configuration appropriés.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotionDatabaseDiscoveryPage;
