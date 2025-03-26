
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useNotionApiInterceptor } from '@/hooks/useNotionApiInterceptor';

// Importer les pages
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Importer les composants principaux
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  // Utiliser l'intercepteur Notion API pour la journalisation et le débogage
  useNotionApiInterceptor();
  
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
            <Route path="/audits/:auditId" element={<AuditPage />} />
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
