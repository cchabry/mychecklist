
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ProxyStatus, ProxyActionButtons, DemoModeIndicator, useProxyStatus } from './proxy-status';

interface ProxyStatusIndicatorProps {
  isDemoMode: boolean;
}

const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({ isDemoMode }) => {
  const { proxyStatus, checking, checkCurrentProxy, findBetterProxy, resetProxies } = useProxyStatus();
  
  // Si on est en mode démo, ne pas afficher les contrôles de proxy
  if (isDemoMode) {
    return <DemoModeIndicator isDemoMode={isDemoMode} />;
  }
  
  return (
    <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-3">
      <h3 className="font-medium mb-2 flex items-center gap-2 text-green-700">
        <ExternalLink size={16} />
        État du proxy CORS
      </h3>
      
      <div className="bg-white p-2 rounded border border-green-100 mb-3">
        <ProxyStatus proxyStatus={proxyStatus} />
      </div>
      
      <ProxyActionButtons 
        checking={checking}
        onCheckCurrentProxy={checkCurrentProxy}
        onFindBetterProxy={findBetterProxy}
        onResetProxies={resetProxies}
      />
    </div>
  );
};

export default ProxyStatusIndicator;
