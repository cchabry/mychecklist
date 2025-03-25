
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getDeploymentType, 
  isDeploymentDebuggingEnabled, 
  enableDeploymentDebugging, 
  disableDeploymentDebugging 
} from '@/lib/notionProxy/config';

const DeploymentDebugger: React.FC = () => {
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  const [deploymentType, setDeploymentType] = useState('inconnu');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  
  // Charger l'état initial
  useEffect(() => {
    setIsDebugEnabled(isDeploymentDebuggingEnabled());
    setDeploymentType(getDeploymentType());
  }, []);
  
  // Gérer l'activation/désactivation du débogage
  const toggleDebugging = () => {
    if (isDebugEnabled) {
      disableDeploymentDebugging();
      setIsDebugEnabled(false);
    } else {
      enableDeploymentDebugging();
      setIsDebugEnabled(true);
    }
  };
  
  // Tester la connexion aux fonctions Netlify
  const testNetlifyConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/.netlify/functions/notion-proxy', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `Connexion réussie: ${data.message || 'Fonction Netlify disponible'}`
        });
      } else {
        setTestResult({
          success: false,
          message: `Erreur ${response.status}: ${await response.text() || 'Fonction Netlify non disponible'}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erreur de connexion: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Diagnostic de déploiement
          <Badge variant={
            deploymentType === 'netlify' ? "success" : 
            deploymentType === 'lovable' ? "secondary" : 
            "outline"
          }>
            {deploymentType}
          </Badge>
        </CardTitle>
        <CardDescription>
          Outils de diagnostic pour débogage du déploiement et des fonctions serverless
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Mode débogage</p>
            <p className="text-xs text-muted-foreground">
              Affiche des logs détaillés dans la console
            </p>
          </div>
          <Switch checked={isDebugEnabled} onCheckedChange={toggleDebugging} />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Proxy CORS actif</p>
          <p className="text-xs bg-muted p-2 rounded overflow-auto">
            Fonctions Netlify (gestion CORS automatique)
          </p>
        </div>
        
        {deploymentType === 'netlify' && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Test des fonctions Netlify</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testNetlifyConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? 'Test en cours...' : 'Tester les fonctions Netlify'}
            </Button>
            
            {testResult && (
              <div className={`mt-2 p-2 rounded text-xs ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {testResult.message}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Les logs détaillés apparaîtront dans la console du navigateur (F12)
        </p>
      </CardFooter>
    </Card>
  );
};

export default DeploymentDebugger;
