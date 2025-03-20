
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Settings, List, Book, FileText } from 'lucide-react';

const MainMenu = () => {
  return (
    <nav className="px-4 py-2 border-b border-gray-200">
      <ul className="flex flex-wrap gap-4 items-center">
        <li>
          <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <Home size={18} />
            <span>Accueil</span>
          </Link>
        </li>
        <li>
          <Link to="/projects" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <List size={18} />
            <span>Projets</span>
          </Link>
        </li>
        <li>
          <Link to="/checklist" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <Book size={18} />
            <span>Checklist</span>
          </Link>
        </li>
        <li>
          <Link to="/notion-config" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <Settings size={18} />
            <span>Configurer Notion</span>
          </Link>
        </li>
        <li>
          <a 
            href="/scriptsNotion.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <FileText size={18} />
            <span>Guide Notion</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default MainMenu;
