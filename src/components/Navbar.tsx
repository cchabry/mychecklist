
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Settings, ClipboardList } from 'lucide-react';

/**
 * Composant de navigation principale
 */
const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Projets', path: '/projects', icon: ClipboardList },
    { name: 'Configuration', path: '/config', icon: Settings },
  ];
  
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-bold text-xl flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="myChecklist Logo" 
                className="h-10 w-auto" 
              />
              <span>myChecklist</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
