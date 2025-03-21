
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface NotionDiagnosticReportProps {
  results?: {
    success: boolean;
    message: string;
    details?: string;
    items?: Array<{
      name: string;
      status: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>;
  };
  showDetails?: boolean;
  buttonLabel?: string;
}

const NotionDiagnosticReport: React.FC<NotionDiagnosticReportProps> = ({ 
  results, 
  showDetails = false,
  buttonLabel = "Détails techniques" 
}) => {
  const [isOpen, setIsOpen] = React.useState(showDetails);
  
  if (!results) {
    return null;
  }
  
  const { success, message, details, items } = results;
  
  return (
    <div className={`rounded-lg border ${success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${success ? 'text-green-600' : 'text-amber-600'}`}>
          {success ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-medium ${success ? 'text-green-800' : 'text-amber-800'}`}>
            {success ? 'Diagnostic réussi' : 'Problèmes détectés'}
          </h3>
          
          <p className={`mt-1 text-sm ${success ? 'text-green-700' : 'text-amber-700'}`}>
            {message}
          </p>
          
          {(details || (items && items.length > 0)) && (
            <button
              className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <>
                  <ChevronUp size={14} />
                  Masquer les {buttonLabel.toLowerCase()}
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Afficher les {buttonLabel.toLowerCase()}
                </>
              )}
            </button>
          )}
          
          {isOpen && (
            <div className="mt-3 text-sm">
              {details && (
                <div className="p-2 bg-white bg-opacity-50 rounded border border-gray-200 mb-2 whitespace-pre-wrap font-mono text-xs">
                  {details}
                </div>
              )}
              
              {items && items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0">
                        {item.status === 'success' && <CheckCircle2 size={16} className="text-green-600" />}
                        {item.status === 'error' && <XCircle size={16} className="text-red-600" />}
                        {item.status === 'warning' && <AlertTriangle size={16} className="text-amber-600" />}
                        {item.status === 'info' && <Info size={16} className="text-blue-600" />}
                      </span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-700">{item.message}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionDiagnosticReport;
