
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionError, NotionErrorType } from '@/services/notion/errorHandling';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, Router, Clock, XCircle, Shield } from 'lucide-react';

interface ErrorDiagnosticsProps {
  error: NotionError;
  onRunDiagnostic?: () => void;
}

const ErrorDiagnostics: React.FC<ErrorDiagnosticsProps> = ({ 
  error,
  onRunDiagnostic 
}) => {
  // Déterminer le type d'erreur
  const getErrorInfo = () => {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return {
          title: "Problème d'authentification",
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          description: "Votre clé API Notion semble être invalide ou expirée",
          solutions: [
            "Vérifiez que votre clé API est correctement configurée",
            "Assurez-vous que votre intégration Notion est active",
            "Générez une nouvelle clé API si nécessaire"
          ]
        };
      
      case NotionErrorType.NETWORK:
        return {
          title: "Problème de connexion réseau",
          icon: <Router className="h-5 w-5 text-amber-500" />,
          description: "Impossible de se connecter à l'API Notion",
          solutions: [
            "Vérifiez votre connexion internet",
            "Assurez-vous que le proxy CORS fonctionne correctement",
            "Réessayez dans quelques instants"
          ]
        };
        
      case NotionErrorType.RATE_LIMIT:
        return {
          title: "Limite de taux d'API dépassée",
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          description: "Vous avez dépassé le nombre de requêtes autorisées",
          solutions: [
            "Attendez quelques minutes avant de réessayer",
            "Réduisez la fréquence de vos requêtes",
            "Optimisez vos opérations pour utiliser moins d'appels API"
          ]
        };
        
      case NotionErrorType.PERMISSION:
        return {
          title: "Problème de permission",
          icon: <Shield className="h-5 w-5 text-red-500" />,
          description: "Vous n'avez pas les permissions nécessaires",
          solutions: [
            "Vérifiez que votre intégration a accès aux ressources demandées",
            "Assurez-vous que les bases de données sont partagées avec l'intégration",
            "Configurez les capacités appropriées pour votre intégration"
          ]
        };
        
      case NotionErrorType.DATABASE:
        return {
          title: "Problème de base de données",
          icon: <Database className="h-5 w-5 text-purple-500" />,
          description: "Problème avec la base de données Notion",
          solutions: [
            "Vérifiez que l'ID de base de données est correct",
            "Assurez-vous que la base de données existe toujours",
            "Configurez la structure correcte de la base de données"
          ]
        };
        
      default:
        return {
          title: "Erreur Notion",
          icon: <AlertTriangle className="h-5 w-5 text-slate-500" />,
          description: "Une erreur s'est produite lors de l'interaction avec Notion",
          solutions: [
            "Vérifiez les détails de l'erreur pour plus d'informations",
            "Consultez la documentation Notion API",
            "Essayez à nouveau plus tard"
          ]
        };
    }
  };
  
  const errorInfo = getErrorInfo();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          {errorInfo.icon}
          <CardTitle className="ml-2 text-lg">{errorInfo.title}</CardTitle>
        </div>
        <CardDescription>
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Solutions possibles :</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {errorInfo.solutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </div>
          
          {onRunDiagnostic && (
            <Button 
              variant="outline" 
              onClick={onRunDiagnostic}
              className="w-full"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Exécuter un diagnostic
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorDiagnostics;
