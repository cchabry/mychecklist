
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const Navbar = () => {
  const location = useLocation()
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projets', path: '/projects' },
    { name: 'Checklist', path: '/checklist' },
  ]
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-bold text-xl flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span>Audit Checklist</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar
