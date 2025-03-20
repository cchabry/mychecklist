
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock, Download, Info, Search, Filter } from 'lucide-react';

import { Audit, CorrectiveAction, ActionPriority, ActionStatus, SamplePage } from '@/lib/types';

interface ActionPlanProps {
  audit: Audit;
  pages: SamplePage[];
  onActionUpdate: (action: CorrectiveAction) => void;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ audit, pages, onActionUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | 'all'>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');

  // Extraire toutes les actions correctives de l'audit
  const allActions = useMemo(() => {
    const actions: Array<CorrectiveAction & { itemId: string; itemTitle: string }> = [];
    
    audit.items.forEach(item => {
      if (item.actions && item.actions.length > 0) {
        item.actions.forEach(action => {
          actions.push({
            ...action,
            itemId: item.id,
            itemTitle: item.title
          });
        });
      }
    });
    
    return actions;
  }, [audit]);

  // Liste des responsables uniques
  const uniqueResponsibles = useMemo(() => {
    return [...new Set(allActions.map(action => action.responsible))];
  }, [allActions]);

  // Filtrer les actions
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      // Recherche textuelle
      const matchesSearch = searchTerm === '' || 
        action.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (action.comment && action.comment.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
      
      // Filtre par priorité
      const matchesPriority = priorityFilter === 'all' || action.priority === priorityFilter;
      
      // Filtre par responsable
      const matchesResponsible = responsibleFilter === 'all' || action.responsible === responsibleFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesResponsible;
    });
  }, [allActions, searchTerm, statusFilter, priorityFilter, responsibleFilter]);

  // Obtenir la couleur en fonction de la priorité
  const getPriorityColor = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.Critical:
        return 'bg-red-100 text-red-800';
      case ActionPriority.High:
        return 'bg-orange-100 text-orange-800';
      case ActionPriority.Medium:
        return 'bg-amber-100 text-amber-800';
      case ActionPriority.Low:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.Done:
        return 'bg-green-100 text-green-800';
      case ActionStatus.InProgress:
        return 'bg-blue-100 text-blue-800';
      case ActionStatus.ToDo:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône en fonction du statut
  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.Done:
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case ActionStatus.InProgress:
        return <Clock className="h-4 w-4 mr-1" />;
      case ActionStatus.ToDo:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return <Info className="h-4 w-4 mr-1" />;
    }
  };

  // Gérer l'exportation du plan d'action
  const handleExportActionPlan = () => {
    // Logique d'exportation (CSV, PDF, etc.)
    console.log('Export action plan:', filteredActions);
    alert('Fonctionnalité d\'exportation à implémenter');
  };

  // Statistiques des actions
  const actionStats = useMemo(() => {
    return {
      total: allActions.length,
      todo: allActions.filter(a => a.status === ActionStatus.ToDo).length,
      inProgress: allActions.filter(a => a.status === ActionStatus.InProgress).length,
      done: allActions.filter(a => a.status === ActionStatus.Done).length,
      critical: allActions.filter(a => a.priority === ActionPriority.Critical).length,
      high: allActions.filter(a => a.priority === ActionPriority.High).length,
    };
  }, [allActions]);

  // Calculer le pourcentage de complétion
  const completionPercentage = useMemo(() => {
    if (allActions.length === 0) return 0;
    return Math.round((actionStats.done / allActions.length) * 100);
  }, [allActions, actionStats]);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            Plan d'action
            {completionPercentage >= 75 ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> {completionPercentage}% terminé
              </Badge>
            ) : completionPercentage >= 25 ? (
              <Badge className="bg-amber-100 text-amber-800">
                <Clock className="h-3.5 w-3.5 mr-1" /> {completionPercentage}% terminé
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> {completionPercentage}% terminé
              </Badge>
            )}
          </CardTitle>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleExportActionPlan}
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {allActions.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Aucune action corrective</AlertTitle>
            <AlertDescription>
              Aucune action corrective n'a été définie pour cet audit.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 mb-6 md:grid-cols-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-1">Total</div>
                <div className="text-2xl font-bold text-blue-900">{actionStats.total}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="font-medium text-red-800 mb-1">Critiques</div>
                <div className="text-2xl font-bold text-red-900">{actionStats.critical}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="font-medium text-amber-800 mb-1">En cours</div>
                <div className="text-2xl font-bold text-amber-900">{actionStats.inProgress}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="font-medium text-green-800 mb-1">Terminées</div>
                <div className="text-2xl font-bold text-green-900">{actionStats.done}</div>
              </div>
            </div>
            
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <span>Statut</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value={ActionStatus.ToDo}>À faire</SelectItem>
                      <SelectItem value={ActionStatus.InProgress}>En cours</SelectItem>
                      <SelectItem value={ActionStatus.Done}>Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <span>Priorité</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value={ActionPriority.Critical}>Critique</SelectItem>
                      <SelectItem value={ActionPriority.High}>Haute</SelectItem>
                      <SelectItem value={ActionPriority.Medium}>Moyenne</SelectItem>
                      <SelectItem value={ActionPriority.Low}>Faible</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {uniqueResponsibles.length > 0 && (
                    <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>Responsable</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les responsables</SelectItem>
                        {uniqueResponsibles.map(resp => (
                          <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Critère</TableHead>
                    <TableHead className="w-[120px]">Page</TableHead>
                    <TableHead className="w-[100px]">Priorité</TableHead>
                    <TableHead className="w-[100px]">Échéance</TableHead>
                    <TableHead className="w-[140px]">Responsable</TableHead>
                    <TableHead className="w-[100px]">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Aucune action ne correspond aux critères de recherche
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActions.map(action => {
                      const page = pages.find(p => p.id === action.pageId);
                      return (
                        <TableRow key={action.id}>
                          <TableCell className="font-medium">{action.itemTitle}</TableCell>
                          <TableCell>{page?.title || 'Page inconnue'}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(action.priority)}>
                              {action.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(action.dueDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{action.responsible}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(action.status)}>
                              {getStatusIcon(action.status)}
                              {action.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionPlan;
