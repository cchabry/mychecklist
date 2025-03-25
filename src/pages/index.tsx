
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useOperationMode } from '@/services/operationMode';
import NetlifyFunctionStatus from '@/components/notion/NetlifyFunctionStatus';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

export default function Home() {
  const { isDemoMode, enableDemoMode, enableRealMode } = useOperationMode();
  const [statusChecked, setStatusChecked] = useState(false);

  // Vérifier le statut des fonctions Netlify une seule fois
  useEffect(() => {
    if (!statusChecked) {
      setStatusChecked(true);
    }
  }, [statusChecked]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Audit Companion</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Plateforme de gestion d'audits et de conformité pour les sites web
          </p>
        </div>
        
        {/* Alerte informative pour expliquer le mode démo */}
        <Alert variant={isDemoMode ? "warning" : "default"}>
          <Shield className="h-4 w-4" />
          <AlertTitle>Information sur le mode de fonctionnement</AlertTitle>
          <AlertDescription>
            Cette application utilise {isDemoMode ? 
              "actuellement des données fictives (mode démo)" : 
              "l'API Notion pour des données réelles"}. 
            {isDemoMode ? 
              "Le mode démo est activé pour éviter les problèmes de CORS avec l'API Notion." : 
              "Les fonctions Netlify servent de proxy pour éviter les problèmes de CORS."}
          </AlertDescription>
        </Alert>
        
        {/* Statut des fonctions Netlify */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">État du système</h2>
          {statusChecked && <NetlifyFunctionStatus />}
        </div>
        
        {/* Mode de fonctionnement */}
        <Card>
          <CardHeader>
            <CardTitle>Mode de fonctionnement actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">
                  Mode actuel: <span className={isDemoMode ? "text-amber-600" : "text-green-600"}>
                    {isDemoMode ? "Démonstration" : "Production"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDemoMode 
                    ? "Le mode démo utilise des données fictives sans appeler l'API Notion" 
                    : "Le mode production se connecte à l'API Notion pour des données réelles"}
                </p>
              </div>
              
              <div>
                <Button 
                  variant={isDemoMode ? "default" : "outline"} 
                  onClick={() => enableRealMode()}
                  disabled={!isDemoMode}
                  className="mr-2"
                >
                  Mode réel
                </Button>
                <Button 
                  variant={isDemoMode ? "outline" : "default"} 
                  onClick={() => enableDemoMode("Mode démonstration activé")}
                  disabled={isDemoMode}
                >
                  Mode démo
                </Button>
              </div>
            </div>
            
            {!isDemoMode && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-4">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Important: Configuration Notion requise</p>
                    <p className="mt-1">
                      Pour utiliser le mode réel, vous devez configurer votre clé API Notion 
                      et l'ID de votre base de données dans la section Configuration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Projets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Accédez à vos projets et créez des audits</p>
              <Button asChild>
                <Link to="/dashboard">Voir les projets</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Configurez votre connexion à Notion</p>
              <Button asChild>
                <Link to="/notion-setup">Configurer Notion</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Vérifier l'état du système et résoudre les problèmes</p>
              <Button asChild>
                <Link to="/diagnostics">Diagnostiquer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
