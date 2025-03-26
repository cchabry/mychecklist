
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useNotionApiInterceptor } from '@/hooks/useNotionApiInterceptor';

// Importer les pages
import Dashboard from './pages/Dashboard';
import ProjectAudit from './pages/audit/ProjectAudit';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/NotFound';

// Importer les composants principaux
import Layout from './components/app/Layout';
import { ThemeProvider } from './contexts/ThemeProvider';

function App() {
  // Utiliser l'intercepteur Notion API pour la journalisation et le débogage
  useNotionApiInterceptor();
  
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<ProjectAudit />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
