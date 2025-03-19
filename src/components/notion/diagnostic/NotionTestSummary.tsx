
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { TestResult } from './NotionTestResult';

interface NotionTestSummaryProps {
  tests: TestResult[][];
}

const NotionTestSummary: React.FC<NotionTestSummaryProps> = ({ tests }) => {
  const flattenedTests = tests.flat();
  
  const summary = {
    success: flattenedTests.filter(r => r.status === 'success').length,
    warning: flattenedTests.filter(r => r.status === 'warning').length,
    error: flattenedTests.filter(r => r.status === 'error').length,
    total: flattenedTests.length
  };
  
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>{summary.success} réussis</span>
      </div>
      <div className="flex items-center gap-1">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span>{summary.warning} avertissements</span>
      </div>
      <div className="flex items-center gap-1">
        <XCircle className="h-4 w-4 text-red-500" />
        <span>{summary.error} échecs</span>
      </div>
    </div>
  );
};

export default NotionTestSummary;
