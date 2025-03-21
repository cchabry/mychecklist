
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { notionApi } from '@/lib/notionProxy';

// Pages
import Dashboard from '@/pages/Dashboard';
import NotionConfig from '@/pages/NotionConfig';
import NewProject from '@/pages/NewProject';
import EditProject from '@/pages/EditProject';
import ProjectAudit from '@/pages/audit/ProjectAudit';
import NewAuditPage from '@/pages/audit/NewAuditPage';
import NotFound from '@/pages/NotFound';
import ErrorPage from '@/pages/ErrorPage';

// Contextes
import { NotionProvider } from '@/contexts/NotionContext';

/**
 * Point d'entrée principal de l'application
 * Configuration de la navigation et des routes
 */
function App() {
  // Forcer le mode mock au démarrage pour le prototype
  useEffect(() => {
    console.log('App component rendering...');
    
    // Vérifier si le mode mock est déjà activé
    if (!notionApi.mockMode.isActive()) {
      // Activer le mode mock pour le prototype
      notionApi.mockMode.activate();
      console.log('Mode mock activé automatiquement au démarrage de l\'application');
    }
  }, []);
  
  return (
    <NotionProvider>
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
    </NotionProvider>
  );
}

export default App;
