
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

const ChecklistPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Référentiel de bonnes pratiques</h1>
          <p className="text-muted-foreground mt-2">
            Consultez et gérez les items de votre checklist de bonnes pratiques
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel item
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contenu du référentiel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le référentiel sera implémenté dans cette section
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChecklistPage
