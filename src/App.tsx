
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MainLayout } from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import ProjectsPage from '@/pages/ProjectsPage';
import ChecklistPage from '@/pages/ChecklistPage';
import AuditsPage from '@/pages/AuditsPage';
import ConfigPage from '@/pages/ConfigPage';
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
          {/* Routes du dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Routes des projets */}
          <Route path="/projects" element={<ProjectsPage />} />
          
          {/* Routes de la checklist */}
          <Route path="/checklist" element={<ChecklistPage />} />
          
          {/* Routes des audits */}
          <Route path="/audits" element={<AuditsPage />} />
          
          {/* Routes de configuration */}
          <Route path="/config" element={<ConfigPage />} />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
