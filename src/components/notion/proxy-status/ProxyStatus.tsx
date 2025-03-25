
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ProxyStatusProps {
  proxyStatus: {
    url: string;
    lastTested: number;
    success: boolean;
    latency?: number;
  } | null;
}

const ProxyStatus: React.FC<ProxyStatusProps> = ({ proxyStatus }) => {
  if (!proxyStatus) {
    return <p className="text-xs text-gray-600">Aucun test de proxy récent</p>;
  }
  
  const timeAgo = Math.round((Date.now() - proxyStatus.lastTested) / 60000);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {proxyStatus.success ? (
          <CheckCircle size={14} className="text-green-500" />
        ) : (
          <AlertCircle size={14} className="text-amber-500" />
        )}
        <p className="text-xs font-medium">
          {proxyStatus.success ? 'Proxy fonctionnel' : 'Proxy non fonctionnel'}
        </p>
      </div>
      <p className="text-xs text-gray-600">Dernier test: il y a {timeAgo} min</p>
      <p className="text-xs font-mono bg-gray-50 p-1 rounded overflow-hidden text-ellipsis">
        {proxyStatus.url}
      </p>
      {proxyStatus.latency && (
        <p className="text-xs text-gray-600">Temps de réponse: {proxyStatus.latency}ms</p>
      )}
    </div>
  );
};

export default ProxyStatus;
