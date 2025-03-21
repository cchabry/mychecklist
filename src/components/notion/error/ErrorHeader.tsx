
import React from 'react';
import { XCircle, AlertTriangle, Info } from 'lucide-react';
import { AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

interface ErrorHeaderProps {
  error: string;
  context?: string;
  isPermissionError?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const ErrorHeader: React.FC<ErrorHeaderProps> = ({ error, context, isPermissionError, isOpen, onClose }) => {
  return (
    <>
      <AlertDialogTitle className="flex items-center gap-2 text-red-600">
        <XCircle size={18} />
        Erreur de connexion à Notion
      </AlertDialogTitle>
      <AlertDialogDescription>
        <div className="mt-1 text-amber-600 font-medium flex items-start gap-2">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
        
        {context && (
          <div className="mt-2 text-gray-600 flex items-start gap-2">
            <Info size={14} className="flex-shrink-0 mt-0.5" /> 
            <span>{context}</span>
          </div>
        )}
        
        {isPermissionError && (
          <div className="mt-4 bg-red-50 p-3 rounded border border-red-200 text-red-700 text-sm">
            <p className="font-medium">Problème de permissions Notion détecté</p>
            <p className="mt-1 text-xs">Pour résoudre ce problème :</p>
            <ul className="mt-1 text-xs list-disc list-inside space-y-1">
              <li>Vérifiez que votre intégration a accès à la base de données</li>
              <li>Assurez-vous que les permissions d'<strong>écriture</strong> sont activées</li>
              <li>Dans Notion, ouvrez votre base de données, cliquez sur les <strong>trois points (...)</strong> en haut à droite</li>
              <li>Sélectionnez <strong>Connexions</strong> et ajoutez votre intégration</li>
            </ul>
          </div>
        )}
      </AlertDialogDescription>
    </>
  );
};

export default ErrorHeader;
