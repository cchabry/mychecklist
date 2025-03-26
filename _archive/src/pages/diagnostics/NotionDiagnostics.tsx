
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

/**
 * Page de diagnostics pour les fonctionnalités Notion
 */
const NotionDiagnostics: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnostics Notion</h1>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Fonctionnalité en développement</AlertTitle>
        <AlertDescription>
          Le système de diagnostic Notion sera implémenté dans une prochaine phase.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>État de la connexion Notion</CardTitle>
          <CardDescription>Vérifiez l'état de la connexion à l'API Notion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Cette page permettra de diagnostiquer la connexion à Notion et d'afficher les informations de diagnostic.</p>
            <Button disabled>Tester la connexion</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotionDiagnostics;
