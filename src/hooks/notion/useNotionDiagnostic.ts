
import { useState } from 'react';
import { TestResult } from '@/components/notion/diagnostic/NotionTestResult';
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { toast } from 'sonner';

export interface DiagnosticResults {
  configTests: TestResult[];
  connectivityTests: TestResult[];
  permissionTests: TestResult[];
  structureTests: TestResult[];
}

const initialResults: DiagnosticResults = {
  configTests: [
    { name: 'Clé API', description: 'Vérifie si une clé API est configurée', status: 'pending' },
    { name: 'Base de données', description: 'Vérifie si une DB Projets est configurée', status: 'pending' },
    { name: 'Base de Checklists', description: 'Vérifie si une DB Checklists est configurée', status: 'pending' }
  ],
  connectivityTests: [
    { name: 'Proxy API', description: 'Vérifie la disponibilité du proxy', status: 'pending' },
    { name: 'Authentification', description: 'Vérifie l\'authentification Notion', status: 'pending' }
  ],
  permissionTests: [
    { name: 'Lecture Projets', description: 'Vérifie les permissions de lecture', status: 'pending' },
    { name: 'Écriture Projets', description: 'Vérifie les permissions d\'écriture', status: 'pending' }
  ],
  structureTests: [
    { name: 'Format Projets', description: 'Vérifie la structure de la DB Projets', status: 'pending' },
    { name: 'Format Checklists', description: 'Vérifie la structure de la DB Checklists', status: 'pending' }
  ]
};

export function useNotionDiagnostic() {
  const [results, setResults] = useState<DiagnosticResults>({...initialResults});
  const [createdPageInfo, setCreatedPageInfo] = useState<{id: string; title: string} | null>(null);

  // Fonction pour mettre à jour les résultats par catégorie
  const updateResults = (category: keyof DiagnosticResults, updatedTests: TestResult[]) => {
    setResults(prev => ({
      ...prev,
      [category]: updatedTests
    }));
  };

  // Réinitialiser les résultats
  const resetResults = () => {
    setResults({...initialResults});
  };

  return {
    results,
    initialResults,
    updateResults,
    resetResults,
    createdPageInfo,
    setCreatedPageInfo
  };
}
