
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, ArrowLeft, Plus } from 'lucide-react';

export interface AuditNotFoundProps {
  projectId?: string;
  error?: string;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ projectId, error }) => {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/');
  };
  
  const createNewAudit = () => {
    if (projectId) {
      navigate(`/projet/${projectId}/audit/new`);
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <FileQuestion className="h-16 w-16 text-gray-400" />
            </div>
            <CardTitle className="text-center text-xl">Audit non trouvé</CardTitle>
            <CardDescription className="text-center">
              {error || "L'audit que vous recherchez n'existe pas ou n'est plus disponible."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Vous pouvez revenir à l'accueil ou créer un nouvel audit pour ce projet.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            {projectId && (
              <Button onClick={createNewAudit}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel audit
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AuditNotFound;
