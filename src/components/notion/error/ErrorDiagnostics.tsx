
import React from 'react';
import NotionWriteTestButton from '../NotionWriteTestButton';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';

interface ErrorDiagnosticsProps {
  onTestSuccess: () => void;
}

const ErrorDiagnostics: React.FC<ErrorDiagnosticsProps> = ({ onTestSuccess }) => {
  const handleForceReset = () => {
    // Force le mode réel et nettoie tous les caches
    notionApi.mockMode.forceReset();
    
    // Notification à l'utilisateur
    setTimeout(() => {
      onTestSuccess();
    }, 300);
  };
  
  const handleCopyDetails = () => {
    // Collecte des informations de diagnostic
    const diagnosticInfo = {
      browserInfo: navigator.userAgent,
      timestamp: new Date().toISOString(),
      localStorage: {
        apiKey: localStorage.getItem('notion_api_key') ? 'Présente' : 'Absente',
        dbId: localStorage.getItem('notion_database_id') ? 'Présent' : 'Absent',
        mockMode: localStorage.getItem('notion_mock_mode') === 'true' ? 'Actif' : 'Inactif',
        lastError: localStorage.getItem('notion_last_error')
      }
    };
    
    // Copie dans le presse-papier
    navigator.clipboard.writeText(JSON.stringify(diagnosticInfo, null, 2))
      .then(() => {
        alert('Informations de diagnostic copiées dans le presse-papier');
      })
      .catch(err => {
        console.error('Erreur lors de la copie des informations de diagnostic', err);
      });
  };
  
  return (
    <div className="mt-4 border-t pt-4 border-gray-200">
      <h4 className="text-sm font-medium mb-2">Tests de diagnostic :</h4>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <NotionWriteTestButton onSuccess={onTestSuccess} />
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={handleForceReset}
          >
            <RefreshCw size={14} />
            Réinitialiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={handleCopyDetails}
          >
            <Download size={14} />
            Exporter diagnostic
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ces tests tentent de diagnostiquer et résoudre les problèmes de connexion à Notion.
        </p>
      </div>
    </div>
  );
};

export default ErrorDiagnostics;
