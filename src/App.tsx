import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import { NotionProvider } from './contexts/NotionContext';
import { Toaster } from './components/ui/toaster';

const App: React.FC = () => {
  return (
    <NotionProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Autres routes de l'application */}
        </Routes>
      </Router>
    </NotionProvider>
  );
};

export default App;
