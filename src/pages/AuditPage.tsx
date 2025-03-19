
import React, { Suspense, useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { AuditContainer } from './audit/AuditContainer';
import { toast } from 'sonner';
import AuditLoader from './audit/components/AuditLoader';
import { notionApi } from '@/lib/notionProxy';

const AuditPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
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
  
  // Détecter les chargements trop longs et proposer de passer en mode démonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
      
      if (!notionApi.mockMode.isActive()) {
        toast.warning("Chargement lent détecté", {
          description: "Voulez-vous activer le mode démonstration ?",
          action: {
            label: "Activer",
            onClick: () => {
              notionApi.mockMode.activate();
              window.location.reload();
            }
          }
        });
      }
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [projectId]);
  
  console.log("Rendu de AuditPage avec projectId:", projectId);
  
  return (
    <Suspense fallback={<AuditLoader />}>
      <AuditContainer 
        projectId={projectId} 
        onError={(error) => {
          console.error("Erreur dans AuditContainer:", error);
          toast.error("Erreur lors du chargement de l'audit", {
            description: error.message || "Une erreur est survenue"
          });
          
          // Si c'est une erreur critique, proposer de retourner à l'accueil
          if (error.isCritical) {
            toast.error("Erreur critique", {
              description: "Impossible de charger l'audit",
              action: {
                label: "Retour à l'accueil",
                onClick: () => navigate("/")
              }
            });
          }
          
          // Activer le mode mock en cas d'erreur
          if (!notionApi.mockMode.isActive()) {
            notionApi.mockMode.activate();
            toast.info('Mode démonstration activé automatiquement', { 
              description: 'Suite à une erreur, l\'application utilise des données fictives'
            });
            
            // Recharger la page après un court délai
            setTimeout(() => window.location.reload(), 1500);
          }
        }}
      />
    </Suspense>
  );
};

export default AuditPage;
