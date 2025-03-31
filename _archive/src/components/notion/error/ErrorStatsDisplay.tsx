
import React from 'react';
import { useErrorCounter } from '@/hooks/notion/useErrorCounter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Brush } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Composant pour afficher les statistiques d'erreurs
 */
const ErrorStatsDisplay: React.FC = () => {
  const {
    stats,
    alerts,
    resetStats,
    getTopErrorTypes,
    getTopErrorEndpoints,
    getErrorTrendByHour,
    getCurrentErrorRatePerMinute
  } = useErrorCounter();
  
  // Obtenir les types d'erreur les plus fréquents
  const topErrorTypes = getTopErrorTypes(5);
  
  // Obtenir les endpoints avec le plus d'erreurs
  const topErrorEndpoints = getTopErrorEndpoints(5);
  
  // Obtenir la tendance d'erreur sur les 12 dernières heures
  const errorTrend = getErrorTrendByHour(12);
  
  // Formater les données pour le graphique
  const chartData = errorTrend.map(item => ({
    heure: new Date(item.hour * 3600000).getHours() + 'h',
    erreurs: item.count
  }));
  
  // Calculer le taux d'erreur par minute actuel
  const currentErrorRate = getCurrentErrorRatePerMinute();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistiques d'erreurs</h2>
        <Button variant="outline" size="sm" onClick={resetStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
      
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertes de seuil d'erreurs</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Carte de synthèse */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Synthèse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total erreurs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taux actuel</p>
                <p className="text-2xl font-bold">{currentErrorRate}/min</p>
              </div>
            </div>
            
            {stats.lastError && (
              <div className="mt-4 space-y-1">
                <p className="text-sm text-muted-foreground">Dernière erreur</p>
                <p className="text-sm truncate">
                  {stats.lastError.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(stats.lastError.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Types d'erreur */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Types d'erreur</CardTitle>
            <CardDescription>
              Répartition par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topErrorTypes.length > 0 ? (
              <>
                {topErrorTypes.map(({ type, count }, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                    <Progress value={(count / stats.total) * 100} className="h-2" />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune erreur enregistrée</p>
            )}
          </CardContent>
        </Card>
        
        {/* Endpoints */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>
              Erreurs par endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topErrorEndpoints.length > 0 ? (
              <div className="space-y-2">
                {topErrorEndpoints.map(({ endpoint, count }, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm truncate max-w-[70%]" title={endpoint}>
                      {endpoint}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune erreur par endpoint enregistrée</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Graphique d'évolution */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des erreurs</CardTitle>
          <CardDescription>
            Nombre d'erreurs par heure sur les dernières 12h
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="heure" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value: number) => [`${value} erreur${value > 1 ? 's' : ''}`, 'Nombre']}
                  labelFormatter={(label) => `À ${label}`}
                />
                <Bar dataKey="erreurs" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorStatsDisplay;
