
import { Link } from "react-router-dom";
import NotionConnectionStatus from "./NotionConnectionStatus";

interface SidebarProps {
  isOpen: boolean;
}

/**
 * Composant de barre latérale de l'application
 */
const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside 
      className={`border-r bg-white overflow-y-auto transition-all duration-300 ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      <div className="p-4">
        <NotionConnectionStatus />
        
        <nav className="mt-6 space-y-1">
          <Link 
            to="/" 
            className="flex items-center px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100"
          >
            Tableau de bord
          </Link>
          
          <Link 
            to="/projects/new" 
            className="flex items-center px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100"
          >
            Nouveau projet
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
