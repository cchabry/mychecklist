
import React from 'react';
import NotionWriteTestButton from '../NotionWriteTestButton';

interface ErrorDiagnosticsProps {
  onTestSuccess: () => void;
}

const ErrorDiagnostics: React.FC<ErrorDiagnosticsProps> = ({ onTestSuccess }) => {
  return (
    <div className="mt-4 border-t pt-4 border-gray-200">
      <h4 className="text-sm font-medium mb-2">Tests de diagnostic :</h4>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <NotionWriteTestButton onSuccess={onTestSuccess} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ce test tente d'écrire une donnée temporaire dans votre base de données pour vérifier les permissions.
        </p>
      </div>
    </div>
  );
};

export default ErrorDiagnostics;
