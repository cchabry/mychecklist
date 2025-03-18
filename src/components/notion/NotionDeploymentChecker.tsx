
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyProxyDeployment } from '@/lib/notionProxy/config';

const NotionDeploymentChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    error?: string;
    isWorking?: boolean;
    message?: string;
  } | null>(null);
  
  const checkDeployment = async () => {
    setIsChecking(true);
    setCheckResult(null);
    
    try {
      const isWorking = await verifyProxyDeployment(true);
      
      if (isWorking) {
        setCheckResult({
          isWorking: true,
          message: "Le proxy CORS est opérationnel!"
        });
      } else {
        setCheckResult({
          isWorking: false,
          error: "Le proxy ne répond pas correctement aux requêtes"
        });
      }
    } catch (error) {
      setCheckResult({
        isWorking: false,
        error: error instanceof Error ? error.message : "Erreur inconnue lors de la vérification"
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-md border mb-4">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <ExternalLink size={16} className="text-blue-500" />
        Test du proxy CORS
      </h3>
      
      <div className="text-sm text-gray-600 mb-3">
        Vérifiez si le proxy CORS client peut accéder à l'API Notion.
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={checkDeployment} 
        disabled={isChecking}
        className="w-full"
      >
        {isChecking ? (
          <>
            <RefreshCw size={14} className="mr-2 animate-spin" />
            Vérification en cours...
          </>
        ) : (
          <>
            <RefreshCw size={14} className="mr-2" />
            Tester le proxy CORS
          </>
        )}
      </Button>
      
      {checkResult && (
        <div className={`mt-3 p-2 rounded text-sm ${
          checkResult.isWorking ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {checkResult.isWorking ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={14} />
              <span>{checkResult.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>{checkResult.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotionDeploymentChecker;
