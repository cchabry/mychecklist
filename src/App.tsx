
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { 
  HomePage, 
  HomeIndex, 
  NewProject, 
  NotFound, 
  SamplePages, 
  NotionSetup, 
  Diagnostics 
} from '@/pages';
import { AuditContainer } from '@/pages/audit';
import { NotionContextProvider } from '@/contexts/NotionContext';

function App() {
  return (
    <NotionContextProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route index element={<HomeIndex />} />
          </Route>
          <Route path="/new" element={<NewProject />} />
          <Route path="/audit/:projectId" element={<AuditContainer />} />
          <Route path="/samples" element={<SamplePages />} />
          <Route path="/notion-setup" element={<NotionSetup />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </NotionContextProvider>
  );
}

export default App;
