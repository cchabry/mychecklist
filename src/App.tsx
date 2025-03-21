
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Dashboard from '@/pages/Dashboard';
import NotionConfig from '@/pages/NotionConfig';
import NewProject from '@/pages/NewProject';
import EditProject from '@/pages/EditProject';
import ProjectAudit from '@/pages/audit/ProjectAudit';
import NewAuditPage from '@/pages/audit/NewAuditPage';
import NotFound from '@/pages/NotFound';
import ErrorPage from '@/pages/ErrorPage';

// Provider pour les services Notion
import { NotionServiceProvider } from '@/contexts/NotionServiceContext';

/**
 * Point d'entrée principal de l'application
 * Configuration de la navigation et des routes
 */
function App() {
  console.log('App component rendering...');
  
  return (
    <NotionServiceProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Page d'accueil - Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Gestion des projets */}
          <Route path="/project/new" element={<NewProject />} />
          <Route path="/project/edit/:id" element={<EditProject />} />
          
          {/* Audits */}
          <Route path="/audit/:projectId" element={<ProjectAudit />} />
          <Route path="/audit/:projectId/:auditId" element={<ProjectAudit />} />
          <Route path="/audit/new/:projectId" element={<NewAuditPage />} />
          
          {/* Configuration Notion */}
          <Route path="/notion-config" element={<NotionConfig />} />
          
          {/* Pages d'erreur */}
          <Route path="/error/:errorType" element={<ErrorPage />} />
          
          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </NotionServiceProvider>
  );
}

export default App;
