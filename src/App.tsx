
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import ProjectCreatePage from '@/pages/ProjectCreatePage';
import ProjectEditPage from '@/pages/ProjectEditPage';
import NotionConfigPage from '@/pages/NotionConfigPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/notion-config" element={<NotionConfigPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects/new" element={<ProjectCreatePage />} />
          <Route path="projects/:projectId/edit" element={<ProjectEditPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
