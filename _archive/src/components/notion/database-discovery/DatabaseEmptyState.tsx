
import React from 'react';

interface DatabaseEmptyStateProps {
  searchTerm: string;
}

const DatabaseEmptyState: React.FC<DatabaseEmptyStateProps> = ({ searchTerm }) => {
  return (
    <p className="text-center text-sm text-gray-500 py-4">
      Aucun résultat trouvé pour "{searchTerm}"
    </p>
  );
};

export default DatabaseEmptyState;
