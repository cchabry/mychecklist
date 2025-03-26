
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">Page non trouvée</h2>
      <p className="mt-2 text-gray-500 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}

export default NotFoundPage
