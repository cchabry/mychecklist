
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, AuditPage, NewProjectPage, NotFoundPage } from './pages';
import { NotionProvider } from './contexts/NotionContext';
import { Toaster } from './components/ui/toaster';
import DiagnosticsPage from './pages/Diagnostics';

const App: React.FC = () => {
  return (
    <NotionProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/audit/:projectId" element={<AuditPage />} />
          <Route path="/new-project" element={<NewProjectPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </NotionProvider>
  );
};

export default App;
