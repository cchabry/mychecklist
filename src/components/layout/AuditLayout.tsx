
import { Outlet, Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, LayoutList, FileText, ListTodo } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Layout pour les pages d'audit
 */
const AuditLayout = () => {
  const { projectId, auditId } = useParams<{ projectId: string, auditId: string }>();
  const location = useLocation();
  
  const navItems = [
    { name: 'Évaluation', path: `/projects/${projectId}/audits/${auditId}`, icon: LayoutList, exact: true },
    { name: 'Synthèse', path: `/projects/${projectId}/audits/${auditId}/summary`, icon: FileText },
    { name: 'Actions', path: `/projects/${projectId}/audits/${auditId}/actions`, icon: ListTodo },
  ];
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="mr-auto">
          <Link to={`/projects/${projectId}/audits`} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Retour aux audits</span>
          </Link>
        </Button>
      </div>
      
      <Card>
        <div className="border-b">
          <div className="flex overflow-x-auto py-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md mr-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                  isActive(item.path, item.exact)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <CardContent className="p-6">
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLayout;
