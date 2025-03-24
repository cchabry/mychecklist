
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigateFunction } from 'react-router-dom';

export interface AuditNotFoundProps {
  projectId?: string;
  error?: string;
  navigate: NavigateFunction;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ projectId, error, navigate }) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Audit non trouvé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {error || `Impossible de charger l'audit pour ce projet.`}
          </p>
          {projectId && (
            <p className="text-sm text-gray-500">
              ID du projet: {projectId}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
          {projectId && (
            <Button onClick={() => navigate(`/project/${projectId}`)}>
              Voir le projet
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuditNotFound;
