
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DemoModeIndicatorProps {
  isDemoMode: boolean;
}

const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ isDemoMode }) => {
  if (!isDemoMode) return null;
  
  return (
    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-3">
      <div className="flex items-center gap-2 text-blue-700">
        <AlertCircle size={16} />
        <p className="text-sm font-medium">Mode démonstration actif</p>
      </div>
      <p className="text-xs text-blue-600 mt-1">
        En mode démonstration, les proxies CORS ne sont pas utilisés car les données sont simulées localement.
      </p>
    </div>
  );
};

export default DemoModeIndicator;
