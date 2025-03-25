
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type ProxyStatus = {
  active: boolean;
  available: boolean;
  currentProxy: string | null;
  lastTested: number | null;
  error?: string;
};

interface ProxyStatusProps {
  proxyStatus: ProxyStatus;
}

const ProxyStatus: React.FC<ProxyStatusProps> = ({ proxyStatus }) => {
  // Fonction pour formater le timestamp en texte relatif
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
    <div>
      <div className="flex items-center text-sm">
        <span className="font-medium mr-2">État:</span>
        {proxyStatus.active ? (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle size={14} /> Actif
          </span>
        ) : proxyStatus.available ? (
          <span className="text-amber-600 flex items-center gap-1">
            <AlertTriangle size={14} /> Disponible mais non utilisé
          </span>
        ) : (
          <span className="text-red-600 flex items-center gap-1">
            <XCircle size={14} /> Non disponible
          </span>
        )}
      </div>
      
      {proxyStatus.currentProxy && (
        <div className="text-xs text-gray-600 mt-1">
          Proxy actuel: {proxyStatus.currentProxy}
        </div>
      )}
      
      {proxyStatus.lastTested && (
        <div className="text-xs text-gray-600 mt-1">
          Dernier test: {formatTimeAgo(proxyStatus.lastTested)}
        </div>
      )}
      
      {proxyStatus.error && (
        <div className="text-xs text-red-600 bg-red-50 p-1 rounded mt-1">
          Erreur: {proxyStatus.error}
        </div>
      )}
    </div>
  );
};

export default ProxyStatus;
