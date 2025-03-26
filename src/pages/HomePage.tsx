
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ClipboardList, Settings, FileText } from 'lucide-react';
import Header from '@/components/shared/Header';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
          <section className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Audit Web</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Plateforme d'audit d'accessibilité pour évaluer et améliorer la conformité de vos sites web
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="gap-2">
                <Link to="/projects">
                  Voir les projets
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/project/new">
                  Créer un projet
                </Link>
              </Button>
            </div>
          </section>
          
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <ClipboardList className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Gérer les projets</CardTitle>
                <CardDescription>
                  Organisez vos sites et applications à auditer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Créez des projets pour chaque site web à auditer, définissez les échantillons de pages et les exigences.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/projects">
                    Accéder aux projets
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Réaliser des audits</CardTitle>
                <CardDescription>
                  Évaluez vos sites selon les critères d'accessibilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Évaluez chaque page de l'échantillon selon les exigences définies et créez des actions correctives.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/diagnostics">
                    Voir les diagnostics
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Settings className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Personnalisez l'application selon vos besoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Configurez l'intégration avec Notion, gérez le référentiel de bonnes pratiques et les paramètres.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/settings">
                    Accéder aux paramètres
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
