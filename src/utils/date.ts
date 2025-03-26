
/**
 * Formate une date pour l'affichage
 * @param dateString Date au format ISO
 * @returns Date formatée en français
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  }).format(date);
};
