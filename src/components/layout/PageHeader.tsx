
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

/**
 * Composant d'en-tête de page
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description && (
        <p className="mt-1 text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;
