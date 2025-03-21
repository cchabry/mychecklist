
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, AuditPage, NewProjectPage, NotFoundPage, CreateDatabasesPage } from './pages';
import { NotionProvider } from './contexts/NotionContext';
import { Toaster } from './components/ui/toaster';
import DiagnosticsPage from './pages/Diagnostics';
import SamplePagesPage from './pages/SamplePages';
import NewAuditPage from './pages/audit/NewAuditPage';

const App: React.FC = () => {
  console.log("App component rendering...");
  return (
    <NotionProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/audit/:projectId" element={<AuditPage />} />
          <Route path="/audit/:projectId/:auditId" element={<AuditPage />} />
          <Route path="/audit/plan/:projectId/:auditId" element={<AuditPage />} />
          <Route path="/audit/new/:projectId" element={<NewAuditPage />} />
          <Route path="/new-project" element={<NewProjectPage />} />
          <Route path="/project/:projectId/pages" element={<SamplePagesPage />} />
          <Route path="/project/edit/:projectId" element={<NewProjectPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/create-databases" element={<CreateDatabasesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </NotionProvider>
  );
};

export default App;
