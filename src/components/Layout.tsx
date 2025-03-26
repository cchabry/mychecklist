
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Audit Checklist | Tous droits réservés
        </div>
      </footer>
    </div>
  )
}

export default Layout
