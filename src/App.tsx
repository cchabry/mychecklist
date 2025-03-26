
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<div className="flex min-h-screen items-center justify-center">
          <h1 className="text-2xl font-bold">Projet initialisé avec succès</h1>
        </div>} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
