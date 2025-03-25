
import React, { useState } from 'react';
import { useNotionApiInterceptor } from '@/hooks/useNotionApiInterceptor';
import { Button } from '@/components/ui/button';
import { notionLogger, NotionLogEntry } from '@/services/notion/diagnostics';

/**
 * Composant de surveillance des appels à l'API Notion
 * Affiche les statistiques et le journal des appels
 */
export function NotionApiMonitor() {
  const { getLog, getStats, clearLog } = useNotionApiInterceptor();
  const [showLog, setShowLog] = useState(false);
  
  // Récupérer les statistiques actuelles
  const stats = getStats();
  
  // Récupérer les dernières entrées du journal
  const recentLogs = getLog().slice(0, 10);
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Surveillance API Notion</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowLog(!showLog)}
          >
            {showLog ? 'Masquer le journal' : 'Afficher le journal'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearLog}
          >
            Effacer
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-gray-500">Requêtes totales</div>
          <div className="text-xl font-semibold">{stats.totalRequests}</div>
        </div>
        <div className="p-3 bg-green-50 rounded border border-green-100">
          <div className="text-sm text-green-600">Succès</div>
          <div className="text-xl font-semibold text-green-700">{stats.successfulRequests}</div>
        </div>
        <div className="p-3 bg-red-50 rounded border border-red-100">
          <div className="text-sm text-red-600">Erreurs</div>
          <div className="text-xl font-semibold text-red-700">{stats.failedRequests}</div>
        </div>
        <div className="p-3 bg-blue-50 rounded border border-blue-100">
          <div className="text-sm text-blue-600">Temps moyen</div>
          <div className="text-xl font-semibold text-blue-700">{stats.averageResponseTime} ms</div>
        </div>
      </div>
      
      {showLog && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Journal récent</h4>
          <div className="max-h-60 overflow-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Heure</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Détails</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLogs.map((log, index) => (
                  <tr key={index} className={log.type === 'error' ? 'bg-red-50' : ''}>
                    <td className="px-3 py-2 text-xs">
                      {log.type === 'request' && <span className="text-blue-600">Requête</span>}
                      {log.type === 'response' && <span className="text-green-600">Réponse</span>}
                      {log.type === 'error' && <span className="text-red-600">Erreur</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {log.method && log.endpoint && `${log.method} ${log.endpoint}`}
                      {log.message && log.message}
                      {log.status && `Status: ${log.status}`}
                      {log.duration && ` (${log.duration}ms)`}
                    </td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-sm text-center text-gray-500">
                      Aucune activité API récente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotionApiMonitor;
