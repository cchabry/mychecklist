
import { ImportanceLevel } from '@/types/enums';
import { Badge } from '@/components/ui/badge';
import { ExigenceStat } from '../types';

interface ExigenceStatsProps {
  stats: ExigenceStat;
}

/**
 * Affiche les statistiques des exigences par niveau d'importance
 */
export function ExigenceStats({ stats }: ExigenceStatsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-5">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Répartition des exigences par niveau d'importance</h3>
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          Majeur: {stats.byImportance[ImportanceLevel.Major]}
        </Badge>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
          Important: {stats.byImportance[ImportanceLevel.Important]}
        </Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Moyen: {stats.byImportance[ImportanceLevel.Medium]}
        </Badge>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          Mineur: {stats.byImportance[ImportanceLevel.Minor]}
        </Badge>
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          Non applicable: {stats.byImportance[ImportanceLevel.NotApplicable]}
        </Badge>
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          Total: {stats.total}
        </Badge>
      </div>
    </div>
  );
}

export default ExigenceStats;
