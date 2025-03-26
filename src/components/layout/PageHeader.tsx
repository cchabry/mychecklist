
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
  className?: string;
}

/**
 * En-tête standardisé pour les pages avec actions optionnelles
 */
const PageHeader = ({ 
  title, 
  description,
  actions = [],
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
          {actions.map((action, index) => (
            action.label ? (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href}>
                    {action.icon}
                    {action.label}
                  </a>
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </Button>
            ) : (
              <div key={index}>{action.icon}</div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
