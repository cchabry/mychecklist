
import React from 'react';

interface NotionErrorStatusSectionProps {
  error: string;
  context?: string;
}

const NotionErrorStatusSection: React.FC<NotionErrorStatusSectionProps> = ({
  error,
  context
}) => {
  return (
    <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
      <h3 className="font-medium mb-2 text-amber-700">Statut actuel</h3>
      <p className="text-sm text-amber-600">{error}</p>
      {context && (
        <div className="mt-2 pt-2 border-t border-amber-200">
          <p className="text-xs text-amber-500">Contexte: {context}</p>
        </div>
      )}
    </div>
  );
};

export default NotionErrorStatusSection;
