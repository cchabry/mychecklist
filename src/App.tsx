
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import NewProjectPage from './pages/NewProjectPage'
import ChecklistPage from './pages/ChecklistPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="project/new" element={<NewProjectPage />} />
          <Route path="project/:projectId" element={<ProjectDetailsPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
