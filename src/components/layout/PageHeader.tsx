
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface PageAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageAction[];
  className?: string;
}

/**
 * En-tête de page avec titre, description et actions
 */
export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn("mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const buttonContent = (
              <>
                {action.icon}
                {action.label}
              </>
            );
            
            return action.href ? (
              <Button
                key={index}
                variant={action.variant || 'default'}
                asChild
              >
                <Link to={action.href}>{buttonContent}</Link>
              </Button>
            ) : (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.icon || null}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
