
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Dashboard from '@/pages/Dashboard'
import Layout from '@/components/Layout'
import ProjectsPage from '@/pages/ProjectsPage'
import ChecklistPage from '@/pages/ChecklistPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
