
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

const ProjectsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos projets d'audit de sites web
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Affichage des projets (pour le moment vide) */}
        <Card>
          <CardHeader>
            <CardTitle>Aucun projet</CardTitle>
            <CardDescription>
              Vous n'avez pas encore créé de projet d'audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cliquez sur "Nouveau projet" pour commencer à auditer un site web
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectsPage
