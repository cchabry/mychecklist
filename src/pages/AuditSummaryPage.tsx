
import { useParams } from 'react-router-dom';
import { 
  BarChart, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock, 
  Info, 
  Download, 
  Eye
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Progress
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { ComplianceStatus } from '@/types/domain';

/**
 * Page de synthèse d'un audit
 */
const AuditSummaryPage = () => {
  const { projectId, auditId } = useParams<{ projectId: string; auditId: string }>();

  // Données simulées pour la visualisation
  const auditData = {
    name: "Audit d'accessibilité - Mars 2023",
    date: "15 mars 2023",
    completionRate: 85,
    score: 72,
    evaluatedCount: 45,
    totalCount: 53,
    complianceStats: {
      compliant: 27,
      partiallyCompliant: 12,
      nonCompliant: 6,
      notEvaluated: 8
    },
    categories: [
      { name: "Accessibilité", compliant: 15, partiallyCompliant: 6, nonCompliant: 2, notEvaluated: 3 },
      { name: "Performance", compliant: 8, partiallyCompliant: 3, nonCompliant: 1, notEvaluated: 2 },
      { name: "SEO", compliant: 4, partiallyCompliant: 3, nonCompliant: 3, notEvaluated: 1 }
    ],
    pages: [
      { name: "Page d'accueil", url: "https://example.com", score: 85 },
      { name: "Contact", url: "https://example.com/contact", score: 62 },
      { name: "À propos", url: "https://example.com/about", score: 78 }
    ],
    criticalIssues: [
      { category: "Accessibilité", description: "Images sans texte alternatif", count: 8 },
      { category: "Performance", description: "Temps de chargement excessif", count: 3 },
      { category: "SEO", description: "Balises meta manquantes", count: 5 }
    ]
  };

  // Fonction pour déterminer la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Fonction pour obtenir la couleur de fond en fonction du statut
  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partiallyCompliant': return 'bg-yellow-100 text-yellow-800';
      case 'nonCompliant': return 'bg-red-100 text-red-800';
      case 'notEvaluated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <PageHeader 
        title={auditData.name} 
        description={`Synthèse des résultats - ${auditData.date}`}
        actions={[
          {
            label: "Exporter PDF",
            icon: <Download className="h-4 w-4 mr-2" />,
            variant: "outline"
          },
          {
            label: "Voir détails",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: () => console.log(`Naviguer vers ${auditId}`)
          }
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score global</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(auditData.score)}>{auditData.score}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur {auditData.evaluatedCount} critères évalués
            </p>
            <Progress value={auditData.score} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditData.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {auditData.evaluatedCount}/{auditData.totalCount} critères évalués
            </p>
            <Progress value={auditData.completionRate} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conformes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {auditData.complianceStats.compliant}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((auditData.complianceStats.compliant / auditData.evaluatedCount) * 100)}% des critères évalués
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Non-conformes</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {auditData.complianceStats.nonCompliant}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((auditData.complianceStats.nonCompliant / auditData.evaluatedCount) * 100)}% des critères évalués
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Résultats par catégorie
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditData.categories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Score: {Math.round(((category.compliant + category.partiallyCompliant * 0.5) / 
                        (category.compliant + category.partiallyCompliant + category.nonCompliant)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full flex h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(category.compliant / (category.compliant + category.partiallyCompliant + category.nonCompliant + category.notEvaluated)) * 100}%` }}
                    />
                    <div 
                      className="bg-yellow-500" 
                      style={{ width: `${(category.partiallyCompliant / (category.compliant + category.partiallyCompliant + category.nonCompliant + category.notEvaluated)) * 100}%` }}
                    />
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(category.nonCompliant / (category.compliant + category.partiallyCompliant + category.nonCompliant + category.notEvaluated)) * 100}%` }}
                    />
                    <div 
                      className="bg-gray-300" 
                      style={{ width: `${(category.notEvaluated / (category.compliant + category.partiallyCompliant + category.nonCompliant + category.notEvaluated)) * 100}%` }}
                    />
                  </div>
                  <div className="flex text-xs mt-1 text-muted-foreground">
                    <div className="flex items-center mr-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                      <span>{category.compliant}</span>
                    </div>
                    <div className="flex items-center mr-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                      <span>{category.partiallyCompliant}</span>
                    </div>
                    <div className="flex items-center mr-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                      <span>{category.nonCompliant}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-1" />
                      <span>{category.notEvaluated}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Problèmes critiques identifiés
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {auditData.criticalIssues.map((issue, index) => (
                <li key={index} className="bg-red-50 p-3 rounded-md border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Catégorie: {issue.category}</p>
                    </div>
                    <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      {issue.count} occurrences
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résultats par page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditData.pages.map((page, index) => (
              <div key={index} className="border p-4 rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{page.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{page.url}</p>
                  </div>
                  <div className={cn("text-sm font-semibold px-3 py-1 rounded-full", getScoreColor(page.score))}>
                    {page.score}%
                  </div>
                </div>
                <Progress value={page.score} className="h-2 mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditSummaryPage;
