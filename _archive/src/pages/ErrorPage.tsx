
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, RefreshCw, AlertCircle } from 'lucide-react';
import { resetApplicationState } from '@/lib/utils';

const ErrorPage: React.FC = () => {
  const { errorType } = useParams<{ errorType: string }>();
  const navigate = useNavigate();

  // Informations sur l'erreur en fonction du type
  const getErrorInfo = () => {
    switch (errorType) {
      case 'project-not-found':
        return {
          title: 'Projet non trouvé',
          description: 'Le projet que vous cherchez n\'existe pas ou a été supprimé.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
      case 'audit-not-found':
        return {
          title: 'Audit non trouvé',
          description: 'L\'audit que vous cherchez n\'existe pas ou a été supprimé.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
      case 'notion-api':
        return {
          title: 'Erreur d\'API Notion',
          description: 'Impossible de communiquer avec l\'API Notion. Vérifiez votre connexion et vos clés d\'API.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
      default:
        return {
          title: 'Erreur inattendue',
          description: 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
    }
  };

  const errorInfo = getErrorInfo();

  // Fonction pour réinitialiser complètement l'application
  const handleReset = () => {
    resetApplicationState();
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              {errorInfo.icon}
            </div>
            <CardTitle className="text-2xl font-bold">{errorInfo.title}</CardTitle>
            <CardDescription className="text-center mt-2">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser l'application
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ErrorPage;
