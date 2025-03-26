
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/**
 * Composant d'en-tête de l'application
 */
const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="h-16 flex items-center px-4 border-b bg-white">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="ml-4 font-semibold text-lg">myChecklist</div>
      
      <div className="ml-auto flex items-center gap-2">
        {/* Espace pour ajouter des boutons d'action et autres éléments */}
      </div>
    </header>
  );
};

export default Header;
