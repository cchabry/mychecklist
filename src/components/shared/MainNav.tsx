
import { Link } from "react-router-dom";
import { Home, Settings, FilePlus, ClipboardList, Database } from 'lucide-react';
import { useSiteConfig } from "@/hooks/use-site-config";
import { Icons } from "@/components/icons";

export function MainNav() {
  const { name } = useSiteConfig();
  
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link to="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {name}
        </span>
      </Link>
      <Link
        to="/project/new"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <FilePlus className="mr-2 h-4 w-4" />
          Nouveau projet
        </div>
      </Link>
      <Link
        to="/projects"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <ClipboardList className="mr-2 h-4 w-4" />
          Projets
        </div>
      </Link>
      <Link
        to="/settings"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </div>
      </Link>
      
      <Link
        to="/notion-inspector"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        <div className="flex items-center">
          <Database className="mr-2 h-4 w-4" />
          BDD Notion
        </div>
      </Link>
    </nav>
  );
}
