
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, AuditPage, NewProjectPage, NotFoundPage } from './pages';
import { NotionProvider } from './contexts/NotionContext';
import { Toaster } from './components/ui/toaster';
import DiagnosticsPage from './pages/Diagnostics';
import SamplePagesPage from './pages/SamplePages';

const App: React.FC = () => {
  console.log("App component rendering...");
  return (
    <NotionProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/audit/:projectId" element={<AuditPage />} />
          <Route path="/new-project" element={<NewProjectPage />} />
          <Route path="/project/:projectId/pages" element={<SamplePagesPage />} />
          <Route path="/project/:projectId/edit" element={<NewProjectPage />} />
          <Route path="/project/:projectId/action-plan" element={<AuditPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </NotionProvider>
  );
};

export default App;
