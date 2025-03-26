
import React from 'react';
import { Link } from 'react-router-dom';
import { MainNav } from './MainNav';

const Header = () => {
  return (
    <header className="border-b">
      <div className="container max-w-6xl mx-auto flex items-center h-16 px-4">
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <Link 
            to="/settings" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Paramètres
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
