
import React, { Suspense } from 'react';
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

export default AuditPage;
