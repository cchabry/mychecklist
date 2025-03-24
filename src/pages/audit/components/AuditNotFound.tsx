
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { NavigateFunction } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export interface AuditNotFoundProps {
  navigate: NavigateFunction;
  projectId?: string;
  error?: string;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ navigate, projectId, error }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertTriangle size={24} />
              <CardTitle className="text-xl">Audit non trouvé</CardTitle>
            </div>
            <CardDescription>
              {error || "L'audit que vous recherchez n'existe pas ou n'est pas accessible."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {projectId 
                ? "Vérifiez que l'ID du projet est correct et que vous avez accès à cet audit."
                : "Vérifiez l'URL et assurez-vous que vous êtes connecté avec les bonnes permissions."}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Button>
            
            {projectId && (
              <Button 
                onClick={() => navigate(`/projet/${projectId}`)}
              >
                Aller au projet
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AuditNotFound;
