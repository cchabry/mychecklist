
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue dans votre application d'audit de sites web
        </p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projets</CardTitle>
            <CardDescription>Gérez vos projets d'audit</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Créez, modifiez et suivez vos projets d'audit et leurs résultats</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/projects" className="w-full">
                Voir les projets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>Référentiel de bonnes pratiques</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Consultez et gérez les items de votre référentiel de bonnes pratiques</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/checklist" className="w-full">
                Voir la checklist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
