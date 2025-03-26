
import { Outlet, Link, useParams, useLocation } from 'react-router-dom';
import { OperationModeIndicator } from '../OperationModeIndicator';
import { Navbar } from '../index';
import { cn } from '@/lib/utils';
import { FileText, LayoutList, CheckSquare, ListTodo } from 'lucide-react';
import { useProjectById } from '@/hooks/useProjectById';
import { Skeleton } from '@/components/ui';

/**
 * Layout spécifique pour les pages de projet
 * Inclut une navigation secondaire entre les différentes sections
 */
const ProjectLayout = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { project, isLoading } = useProjectById(projectId || '');
  
  const navItems = [
    { name: 'Détails', path: `/projects/${projectId}`, icon: FileText, exact: true },
    { name: 'Exigences', path: `/projects/${projectId}/exigences`, icon: CheckSquare },
    { name: 'Audits', path: `/projects/${projectId}/audits`, icon: LayoutList },
    { name: 'Actions', path: `/projects/${projectId}/actions`, icon: ListTodo },
  ];
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="fixed top-16 right-4 z-50">
        <OperationModeIndicator />
      </div>
      
      {/* Sous-header avec le nom du projet */}
      <div className="bg-primary text-primary-foreground py-4 border-b">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <Skeleton className="h-8 w-72" />
          ) : (
            <h1 className="text-2xl font-bold">{project?.name || 'Projet non trouvé'}</h1>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto py-2">
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
          </nav>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProjectLayout;
