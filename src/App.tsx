
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MainLayout, ProjectLayout, AuditLayout } from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailsPage from '@/pages/ProjectDetailsPage';
import ProjectExigencesPage from '@/pages/ProjectExigencesPage';
import ProjectAuditsPage from '@/pages/ProjectAuditsPage';
import ProjectActionsPage from '@/pages/ProjectActionsPage';
import ProjectCreatePage from '@/pages/ProjectCreatePage';
import ProjectEditPage from '@/pages/ProjectEditPage';
import AuditCreatePage from '@/pages/AuditCreatePage';
import AuditDetailsPage from '@/pages/AuditDetailsPage';
import AuditSummaryPage from '@/pages/AuditSummaryPage';
import AuditActionsPage from '@/pages/AuditActionsPage';
import ConfigPage from '@/pages/ConfigPage';
import ChecklistPage from '@/pages/ChecklistPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Composant principal de l'application
 * Configuration du routage
 */
function App() {
  return (
    <>
      <Routes>
        {/* Layout principal */}
        <Route element={<MainLayout />}>
          {/* Dashboard (liste des projets) */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Routes des projets */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectCreatePage />} />
          
          {/* Configuration */}
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/config/checklist" element={<ChecklistPage />} />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Layout de projet */}
        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<ProjectDetailsPage />} />
          <Route path="exigences" element={<ProjectExigencesPage />} />
          <Route path="audits" element={<ProjectAuditsPage />} />
          <Route path="edit" element={<ProjectEditPage />} />
          <Route path="actions" element={<ProjectActionsPage />} />
          <Route path="audits/new" element={<AuditCreatePage />} />
        </Route>

        {/* Layout d'audit */}
        <Route path="/projects/:projectId/audits/:auditId" element={<AuditLayout />}>
          <Route index element={<AuditDetailsPage />} />
          <Route path="summary" element={<AuditSummaryPage />} />
          <Route path="actions" element={<AuditActionsPage />} />
        </Route>
      </Routes>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
