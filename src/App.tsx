
import { Routes, Route } from 'react-router-dom';
import { MainLayout, ProjectLayout } from '@/components/layout';
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
import ConfigPage from '@/pages/ConfigPage';
import ChecklistPage from '@/pages/ChecklistPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Main application component
 * Routing configuration
 */
function App() {
  return (
    <Routes>
      {/* Main Layout */}
      <Route element={<MainLayout />}>
        {/* Dashboard (project list) */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Project Routes */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectCreatePage />} />
        
        {/* Configuration */}
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/config/checklist" element={<ChecklistPage />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      {/* Project Layout */}
      <Route path="/projects/:projectId" element={<ProjectLayout />}>
        <Route index element={<ProjectDetailsPage />} />
        <Route path="exigences" element={<ProjectExigencesPage />} />
        <Route path="audits" element={<ProjectAuditsPage />} />
        <Route path="edit" element={<ProjectEditPage />} />
        <Route path="actions" element={<ProjectActionsPage />} />
        <Route path="audits/new" element={<AuditCreatePage />} />
        <Route path="audits/:auditId" element={<AuditDetailsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
