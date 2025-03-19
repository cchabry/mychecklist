
import React, { Suspense } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { AuditContainer } from './audit/AuditContainer';
import { toast } from 'sonner';
import AuditLoader from './audit/components/AuditLoader';
import { notionApi } from '@/lib/notionProxy';

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // Force le mode démo au chargement de la page
  React.useEffect(() => {
    if (!notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo pour le prototype");
      notionApi.mockMode.activate();
    }
  }, []);
  
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
  
  // Définir un gestionnaire d'erreurs global pour AuditContainer
  const handleAuditError = (error) => {
    console.error("Erreur dans AuditContainer:", error);
    
    // En mode prototype, on ne veut pas rediriger vers l'accueil
    // mais plutôt afficher un message et continuer avec les données mock
    toast.error("Erreur lors du chargement de l'audit", {
      description: typeof error === 'string' ? error : error.message || "Une erreur est survenue"
    });
    
    // Activer le mode mock en cas d'erreur (si ce n'est pas déjà fait)
    if (!notionApi.mockMode.isActive()) {
      notionApi.mockMode.activate();
      toast.info('Mode démonstration activé automatiquement', { 
        description: 'L\'application utilise des données fictives pour le prototype'
      });
    }
  };
  
  console.log("Rendu de AuditPage avec projectId:", projectId);
  
  return (
    <Suspense fallback={<AuditLoader />}>
      <AuditContainer 
        projectId={projectId} 
        onError={handleAuditError}
      />
    </Suspense>
  );
};

export default AuditPage;
