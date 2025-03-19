
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuditContainer } from './audit/AuditContainer';
import { toast } from 'sonner';

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Si projectId est manquant, rediriger vers la page d'accueil avec un message d'erreur
  if (!projectId) {
    console.error("Aucun projectId fourni à AuditPage");
    
    // Afficher un toast d'erreur
    toast.error("Erreur", {
      description: "Identifiant de projet manquant"
    });
    
    // Rediriger vers la page d'accueil
    return <Navigate to="/" replace />;
  }
  
  console.log("Rendu de AuditPage avec projectId:", projectId);
  return <AuditContainer projectId={projectId} />;
};

export default AuditPage;
