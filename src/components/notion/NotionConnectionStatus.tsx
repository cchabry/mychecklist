
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { operationMode } from '@/services/operationMode';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

interface StatusDetails {
  lastChecked: number;
  isConnected: boolean;
  error?: string;
}

const NotionConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<StatusDetails | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  // Charger le statut enregistré au chargement du composant
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem('notion_connection_status');
      if (savedStatus) {
        setStatus(JSON.parse(savedStatus));
      }
    } catch (e) {
      console.error('Erreur lors du chargement du statut de connexion:', e);
    }
  }, []);
  
  // Vérifier la connexion Notion
  const checkConnection = async () => {
    setIsChecking(true);
    
    try {
      const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      
      if (!apiKey) {
        throw new Error('Clé API Notion non configurée');
      }
      
      // Force real mode
      const wasMockMode = notionApi.mockMode.isActive();
      if (wasMockMode) {
        notionApi.mockMode.deactivate();
      }
      
      // Tester la connexion
      console.log(`🔍 Test de connexion Notion avec clé: ${apiKey.substring(0, 4)}...`);
      await notionApi.users.me(apiKey);
      
      const newStatus = {
        lastChecked: Date.now(),
        isConnected: true
      };
      
      setStatus(newStatus);
      localStorage.setItem('notion_connection_status', JSON.stringify(newStatus));
      
      toast.success('Connexion Notion OK', {
        description: 'L\'API Notion est accessible'
      });
      
      // Si on était en mode mock et que la connexion fonctionne, rester en mode réel
      if (wasMockMode) {
        operationMode.enableRealMode();
        toast.info('Mode réel activé', {
          description: 'La connexion fonctionne, le mode démo a été désactivé'
        });
      }
    } catch (error) {
      console.error('Erreur de connexion Notion:', error);
      
      const newStatus = {
        lastChecked: Date.now(),
        isConnected: false,
        error: error.message
      };
      
      setStatus(newStatus);
      localStorage.setItem('notion_connection_status', JSON.stringify(newStatus));
      
      // Afficher l'erreur
      toast.error('Erreur de connexion Notion', {
        description: error.message
      });
      
      // Avertir le système d'opération de l'erreur
      operationMode.handleConnectionError(error, 'Test de connexion Notion');
    } finally {
      setIsChecking(false);
    }
  };
  
  // Forcer le mode démo
  const forceDemo = () => {
    operationMode.enableDemoMode('Activation manuelle');
    toast.success('Mode démo activé', {
      description: 'L\'application utilise maintenant des données de démonstration'
    });
  };
  
  // Forcer le mode réel
  const forceReal = () => {
    operationMode.enableRealMode();
    toast.success('Mode réel activé', {
      description: 'L\'application tente d\'utiliser l\'API Notion réelle'
    });
  };
  
  // Formater le temps écoulé
  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    
    if (minutes < 1) return 'il y a quelques secondes';
    if (minutes === 1) return 'il y a 1 minute';
    if (minutes < 60) return `il y a ${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'il y a 1 heure';
    if (hours < 24) return `il y a ${hours} heures`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'il y a 1 jour';
    return `il y a ${days} jours`;
  };
  
  return (
    <div className="bg-gray-50 p-3 rounded-md border mb-3">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        {operationMode.isDemoMode ? (
          <AlertCircle size={16} className="text-amber-500" />
        ) : status?.isConnected ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <XCircle size={16} className="text-red-500" />
        )}
        Statut de connexion Notion
      </h3>
      
      <div className="bg-white p-2 rounded border mb-3 text-sm">
        {operationMode.isDemoMode ? (
          <p className="text-amber-600">Mode démonstration actif - données simulées</p>
        ) : status ? (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <span className="font-medium mr-2">État:</span>
              {status.isConnected ? (
                <span className="text-green-600">Connecté</span>
              ) : (
                <span className="text-red-600">Non connecté</span>
              )}
            </div>
            
            <p className="text-xs text-gray-600">
              Dernier test: {formatTimeAgo(status.lastChecked)}
            </p>
            
            {status.error && (
              <p className="text-xs text-red-600 bg-red-50 p-1 rounded">
                Erreur: {status.error}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Aucune vérification effectuée</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
          className="text-xs"
        >
          {isChecking ? (
            <><RefreshCw size={14} className="mr-1 animate-spin" /> Test en cours...</>
          ) : (
            <><RefreshCw size={14} className="mr-1" /> Tester la connexion</>
          )}
        </Button>
        
        {operationMode.isDemoMode ? (
          <Button
            variant="outline"
            size="sm"
            onClick={forceReal}
            className="text-xs text-blue-600"
          >
            Forcer mode réel
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={forceDemo}
            className="text-xs text-amber-600"
          >
            Forcer mode démo
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotionConnectionStatus;
