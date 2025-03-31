
import React from 'react';
import ProgressBar from '@/components/ProgressBar';
import { Audit, ComplianceStatus } from '@/lib/types';

interface AuditProgressProps {
  audit: Audit;
}

const AuditProgress: React.FC<AuditProgressProps> = ({ audit }) => {
  const getCompletionStats = () => {
    const evaluated = audit.items.filter(
      item => item.status !== ComplianceStatus.NotEvaluated
    ).length;
    return { evaluated, total: audit.items.length };
  };
  
  const stats = getCompletionStats();
  
  return (
    <ProgressBar 
      progress={stats.evaluated} 
      total={stats.total} 
      score={audit.score} 
    />
  );
};

export default AuditProgress;
