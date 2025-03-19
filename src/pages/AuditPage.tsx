
import React from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './audit/AuditContainer';

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    console.error("Aucun projectId fourni à AuditPage");
    return <div className="text-center p-8">Erreur: Identifiant de projet manquant</div>;
  }
  
  console.log("Rendu de AuditPage avec projectId:", projectId);
  return <AuditContainer projectId={projectId} />;
};

export default AuditPage;
