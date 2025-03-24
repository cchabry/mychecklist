
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import {
  HomePage,
  NotFoundPage,
  NewProjectPage,
  CreateDatabasesPage,
  AuditPage,
  DiagnosticsPage,
  SamplePagesPage,
  ConfigureExigences,
  NotionDatabaseDiscoveryPage
} from '@/pages';
import ConfigPage from '@/pages/ConfigPage';
import { NotionProvider } from '@/contexts/NotionContext';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <div className="App">
      <NotionProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              <Route path="/new-project" element={<NewProjectPage />} />
              <Route path="/project/:projectId/sample-pages" element={<SamplePagesPage />} />
              <Route path="/project/:projectId/exigences" element={<ConfigureExigences />} />
              <Route path="/audit/:projectId/:auditId" element={<AuditPage />} />
              <Route path="/audit/:projectId" element={<AuditPage />} />
              <Route path="/create-databases" element={<CreateDatabasesPage />} />
              <Route path="/database-discovery" element={<NotionDatabaseDiscoveryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster richColors position="bottom-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </NotionProvider>
    </div>
  );
}

export default App;
