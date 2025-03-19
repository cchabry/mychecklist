
import React, { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuditContainer } from './audit/AuditContainer';

// Wrapper avec un fallback loading state
const Audit = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    console.error("Aucun projectId fourni à Audit");
    return (
      <Navigate to="/" replace />
    );
  }
  
  console.log("Rendu de Audit avec projectId:", projectId);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-transparent border-tmw-teal rounded-full animate-spin"></div>
      </div>
    }>
      <AuditContainer projectId={projectId} />
    </Suspense>
  );
};

export default Audit;
