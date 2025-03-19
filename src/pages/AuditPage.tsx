
import React from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './audit/AuditContainer';

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    console.error("Aucun projectId fourni à AuditPage");
    return <div>Erreur: Identifiant de projet manquant</div>;
  }
  
  console.log("Rendu de AuditPage avec projectId:", projectId);
  return <AuditContainer />;
};

export default AuditPage;
