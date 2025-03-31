
import React, { useEffect } from 'react';
import { DiagnosticResults, useNotionDiagnostic } from '@/hooks/notion/useNotionDiagnostic';
import { runDiagnostics } from '@/services/notion/diagnosticRunner';

export type { DiagnosticResults } from '@/hooks/notion/useNotionDiagnostic';

interface NotionDiagnosticRunnerProps {
  onComplete: (results: DiagnosticResults) => void;
  persistCreatedPage?: boolean;
}

const NotionDiagnosticRunner: React.FC<NotionDiagnosticRunnerProps> = ({ 
  onComplete,
  persistCreatedPage = false
}) => {
  const { 
    initialResults, 
    setCreatedPageInfo 
  } = useNotionDiagnostic();
  
  // Exécuter les tests au chargement
  useEffect(() => {
    runDiagnostics({
      persistCreatedPage,
      onComplete,
      onPageCreated: (pageInfo) => {
        setCreatedPageInfo(pageInfo);
      },
      initialResults
    });
  }, [persistCreatedPage]);
  
  return null; // Ce composant n'affiche rien, il exécute juste les tests
};

export default NotionDiagnosticRunner;
