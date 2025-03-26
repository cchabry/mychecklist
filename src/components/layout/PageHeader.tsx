
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export interface PageAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageAction[];
}

/**
 * Composant d'en-tête de page
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-gray-600">{description}</p>
        )}
      </div>
      
      {actions && actions.length > 0 && (
        <div className="mt-4 flex items-center gap-2 md:mt-0">
          {actions.map((action, index) => {
            // Si c'est juste un élément React (comme un input avec une recherche)
            if (typeof action.label === 'string' && action.label === '' && action.icon) {
              return <React.Fragment key={index}>{action.icon}</React.Fragment>;
            }
            
            // Pour les boutons avec lien
            if (action.href) {
              return (
                <Button 
                  key={index} 
                  variant={action.variant || 'default'} 
                  asChild
                >
                  <Link to={action.href}>
                    {action.icon}
                    {action.label}
                  </Link>
                </Button>
              );
            }
            
            // Pour les boutons standards
            return (
              <Button 
                key={index} 
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
