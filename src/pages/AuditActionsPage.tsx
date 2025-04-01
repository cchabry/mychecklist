
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { AuditActionCard } from '@/components/audit';
import { ActionPriority, ActionStatus, ComplianceStatus } from '@/types/domain';

/**
 * Page de visualisation des actions correctives d'un audit
 */
const AuditActionsPage = () => {
  const { projectId, auditId } = useParams<{ projectId: string; auditId: string }>();

  // Données simulées pour les actions correctives
  const actionData = [
    {
      id: "1",
      description: "Ajouter des textes alternatifs à toutes les images",
      page: "Page d'accueil",
      priority: ActionPriority.High,
      status: ActionStatus.InProgress,
      dueDate: "2023-04-30",
      responsible: "Jean Dupont",
      targetStatus: ComplianceStatus.Compliant
    },
    {
      id: "2",
      description: "Améliorer le contraste des textes sur fond coloré",
      page: "Page Contact",
      priority: ActionPriority.Medium,
      status: ActionStatus.ToDo,
      dueDate: "2023-05-15",
      responsible: "Marie Martin",
      targetStatus: ComplianceStatus.Compliant
    },
    {
      id: "3",
      description: "Ajouter des étiquettes à tous les champs de formulaire",
      page: "Page Contact",
      priority: ActionPriority.Critical,
      status: ActionStatus.ToDo,
      dueDate: "2023-04-25",
      responsible: "Jean Dupont",
      targetStatus: ComplianceStatus.Compliant
    },
    {
      id: "4",
      description: "Optimiser les images pour réduire le temps de chargement",
      page: "Page d'accueil",
      priority: ActionPriority.Low,
      status: ActionStatus.Done,
      dueDate: "2023-04-10",
      responsible: "Sophie Bernard",
      targetStatus: ComplianceStatus.Compliant
    },
    {
      id: "5",
      description: "Corriger la structure des titres (h1, h2, h3)",
      page: "À propos",
      priority: ActionPriority.Medium,
      status: ActionStatus.Blocked,
      dueDate: "2023-05-05",
      responsible: "Marie Martin",
      targetStatus: ComplianceStatus.Compliant
    }
  ];

  // Grouper les actions par statut
  const groupedActions = {
    todo: actionData.filter(action => action.status === ActionStatus.ToDo),
    inProgress: actionData.filter(action => action.status === ActionStatus.InProgress),
    done: actionData.filter(action => action.status === ActionStatus.Done),
    blocked: actionData.filter(action => action.status === ActionStatus.Blocked)
  };

  // Calculer les statistiques
  const stats = {
    total: actionData.length,
    todo: groupedActions.todo.length,
    inProgress: groupedActions.inProgress.length,
    done: groupedActions.done.length,
    blocked: groupedActions.blocked.length,
    completion: Math.round((groupedActions.done.length / actionData.length) * 100)
  };

  return (
    <div>
      <PageHeader 
        title="Plan d'action" 
        description={`Suivi des actions correctives - ${stats.completion}% complet`}
      />

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Actions à réaliser</p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">À faire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.todo}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.todo / stats.total) * 100)}% du total
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.inProgress / stats.total) * 100)}% du total
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Terminées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.done / stats.total) * 100)}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Actions à faire</h2>
          <div className="space-y-3">
            {groupedActions.todo.map(action => (
              <AuditActionCard
                key={action.id}
                description={action.description}
                page={action.page}
                priority={action.priority}
                status={action.status}
                dueDate={action.dueDate}
                responsible={action.responsible}
                targetStatus={action.targetStatus}
              />
            ))}
            {groupedActions.todo.length === 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Aucune action à faire
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Actions en cours</h2>
          <div className="space-y-3">
            {groupedActions.inProgress.map(action => (
              <AuditActionCard
                key={action.id}
                description={action.description}
                page={action.page}
                priority={action.priority}
                status={action.status}
                dueDate={action.dueDate}
                responsible={action.responsible}
                targetStatus={action.targetStatus}
              />
            ))}
            {groupedActions.inProgress.length === 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Aucune action en cours
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Actions terminées</h2>
          <div className="space-y-3">
            {groupedActions.done.map(action => (
              <AuditActionCard
                key={action.id}
                description={action.description}
                page={action.page}
                priority={action.priority}
                status={action.status}
                dueDate={action.dueDate}
                responsible={action.responsible}
                targetStatus={action.targetStatus}
              />
            ))}
            {groupedActions.done.length === 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Aucune action terminée
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {groupedActions.blocked.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Actions bloquées</h2>
            <div className="space-y-3">
              {groupedActions.blocked.map(action => (
                <AuditActionCard
                  key={action.id}
                  description={action.description}
                  page={action.page}
                  priority={action.priority}
                  status={action.status}
                  dueDate={action.dueDate}
                  responsible={action.responsible}
                  targetStatus={action.targetStatus}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditActionsPage;
