
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
import ConfigureExigences from '@/pages/project/ConfigureExigences';
import ConfigPage from '@/pages/ConfigPage';
import NotionDatabasesInspector from '@/pages/NotionDatabasesInspector';
import Diagnostics from '@/pages/Diagnostics';
import DiagnosticsRoutes from '@/pages/diagnostics/DiagnosticsRoutes';

// Provider pour les services Notion
import { NotionServiceProvider } from '@/contexts/NotionServiceContext';
import { useNotionRequestLogger } from '@/hooks/useNotionRequestLogger';

// Composant pour activer le logger de requêtes
const NotionRequestLoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useNotionRequestLogger();
  return <>{children}</>;
};

/**
 * Point d'entrée principal de l'application
 * Configuration de la navigation et des routes
 */
function App() {
  return (
    <NotionServiceProvider>
      <NotionRequestLoggerProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Page d'accueil - Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Gestion des projets */}
            <Route path="/project/new" element={<NewProject />} />
            <Route path="/project/edit/:id" element={<EditProject />} />
            <Route path="/projects" element={<Dashboard />} />
            
            {/* Audits */}
            <Route path="/audit/:projectId" element={<ProjectAudit />} />
            <Route path="/audit/:projectId/:auditId" element={<ProjectAudit />} />
            <Route path="/audit/new/:projectId" element={<NewAuditPage />} />
            
            {/* Configuration Notion */}
            <Route path="/notion-config" element={<NotionConfig />} />
            
            {/* Configuration du Mode Opérationnel */}
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/settings" element={<ConfigPage />} />
            
            {/* Pages d'erreur */}
            <Route path="/error/:errorType" element={<ErrorPage />} />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFound />} />
            
            {/* Exigences */}
            <Route path="/project/:projectId/exigences" element={<ConfigureExigences />} />
            
            {/* Inspection des bases de données Notion */}
            <Route path="/notion-inspector" element={<NotionDatabasesInspector />} />
            
            {/* Diagnostics */}
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/diagnostics/*" element={<DiagnosticsRoutes />} />
          </Routes>
        </Router>
      </NotionRequestLoggerProvider>
    </NotionServiceProvider>
  );
}

export default App;
