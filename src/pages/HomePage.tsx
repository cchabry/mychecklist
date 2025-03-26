
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Audit Web</h1>
        <p className="text-muted-foreground mt-2">
          Application d'audit d'accessibilité web
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle architecture</CardTitle>
          <CardDescription>
            Cette application est en cours de refonte architecturale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Bienvenue dans la nouvelle version de l'application. 
            La structure de base a été mise en place, mais les fonctionnalités 
            sont encore en cours d'implémentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
