
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, ClipboardCheck, BarChart2, Settings } from 'lucide-react';
import NotionConnectionStatus from './NotionConnectionStatus';

interface SidebarProps {
  isOpen: boolean;
}

/**
 * Sidebar de l'application
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div className="h-full w-64 border-r bg-white p-4 flex flex-col">
      <div className="flex flex-col flex-1">
        <NotionConnectionStatus />
        
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
              ${isActive 
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
            end
          >
            <Home className="h-4 w-4" />
            <span>Tableau de bord</span>
          </NavLink>
          
          <NavLink
            to="/projects"
            className={({ isActive }) => 
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
              ${isActive 
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <FolderKanban className="h-4 w-4" />
            <span>Projets</span>
          </NavLink>
          
          <NavLink
            to="/checklists"
            className={({ isActive }) => 
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
              ${isActive 
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Checklists</span>
          </NavLink>
          
          <NavLink
            to="/reports"
            className={({ isActive }) => 
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
              ${isActive 
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <BarChart2 className="h-4 w-4" />
            <span>Rapports</span>
          </NavLink>
        </nav>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) => 
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
            ${isActive 
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
