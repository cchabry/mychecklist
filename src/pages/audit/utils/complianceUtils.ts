
import { ComplianceStatus } from '@/lib/types';

type ColorType = "bg" | "text" | "border";

/**
 * Obtenir la couleur correspondant à un statut de conformité
 */
export const getComplianceStatusColor = (status: ComplianceStatus, type: ColorType = "bg"): string => {
  const colors = {
    [ComplianceStatus.Compliant]: {
      bg: "rgba(0, 200, 83, 0.15)",
      text: "rgb(0, 120, 50)",
      border: "rgba(0, 200, 83, 0.5)"
    },
    [ComplianceStatus.PartiallyCompliant]: {
      bg: "rgba(255, 166, 0, 0.15)",
      text: "rgb(180, 100, 0)",
      border: "rgba(255, 166, 0, 0.5)"
    },
    [ComplianceStatus.NonCompliant]: {
      bg: "rgba(244, 67, 54, 0.15)",
      text: "rgb(200, 30, 30)",
      border: "rgba(244, 67, 54, 0.5)"
    },
    [ComplianceStatus.NotEvaluated]: {
      bg: "rgba(158, 158, 158, 0.15)",
      text: "rgb(100, 100, 100)",
      border: "rgba(158, 158, 158, 0.5)"
    },
    [ComplianceStatus.NotApplicable]: {
      bg: "rgba(96, 125, 139, 0.15)",
      text: "rgb(70, 90, 100)",
      border: "rgba(96, 125, 139, 0.5)"
    }
  };
  
  return colors[status]?.[type] || colors[ComplianceStatus.NotEvaluated][type];
};

/**
 * Calculer le statut global pour un item d'audit basé sur ses résultats par page
 */
export const calculateOverallStatus = (
  pageResults: { status: ComplianceStatus }[],
  itemImportance: string
): ComplianceStatus => {
  // Si l'importance est N/A, l'item est non applicable
  if (itemImportance === "N/A") {
    return ComplianceStatus.NotApplicable;
  }
  
  // Si aucun résultat de page, l'item n'est pas évalué
  if (!pageResults || pageResults.length === 0) {
    return ComplianceStatus.NotEvaluated;
  }
  
  // Filtrer les résultats évalués (ni NotEvaluated ni NotApplicable)
  const evaluatedResults = pageResults.filter(
    r => r.status !== ComplianceStatus.NotEvaluated && 
         r.status !== ComplianceStatus.NotApplicable
  );
  
  if (evaluatedResults.length === 0) {
    return ComplianceStatus.NotEvaluated;
  }
  
  // Si au moins une page est non conforme, l'item est non conforme
  if (evaluatedResults.some(r => r.status === ComplianceStatus.NonCompliant)) {
    return ComplianceStatus.NonCompliant;
  }
  
  // Si toutes les pages sont conformes, l'item est conforme
  if (evaluatedResults.every(r => r.status === ComplianceStatus.Compliant)) {
    return ComplianceStatus.Compliant;
  }
  
  // Sinon, partiellement conforme
  return ComplianceStatus.PartiallyCompliant;
};

/**
 * Calculer le score global pour un audit basé sur les résultats des items
 */
export const calculateAuditScore = (items: {
  status: ComplianceStatus;
  importance: string;
}[]): number => {
  // Filtrer les items qui ne sont pas N/A et qui sont évalués
  const evaluatedItems = items.filter(
    item => item.importance !== "N/A" && 
            item.status !== ComplianceStatus.NotEvaluated && 
            item.status !== ComplianceStatus.NotApplicable
  );
  
  if (evaluatedItems.length === 0) return 0;
  
  // Calculer le score en pourcentage
  const totalPossibleScore = evaluatedItems.length;
  const actualScore = evaluatedItems.reduce((sum, item) => {
    const value = 
      item.status === ComplianceStatus.Compliant ? 1 :
      item.status === ComplianceStatus.PartiallyCompliant ? 0.5 : 0;
    return sum + value;
  }, 0);
  
  return Math.round((actualScore / totalPossibleScore) * 100);
};
