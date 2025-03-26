
/**
 * Utilitaires de manipulation de dates
 */

/**
 * Formate une date en format local français
 * @param dateString - La date à formater (chaîne ISO)
 * @returns Date formatée
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return dateString;
  }
};

/**
 * Calcule le temps écoulé depuis une date
 * @param dateString - La date à partir de laquelle calculer (chaîne ISO)
 * @returns Temps écoulé en format lisible
 */
export const timeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'à l\'instant';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `il y a ${months} mois`;
    
    const years = Math.floor(months / 12);
    return `il y a ${years} an${years > 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Erreur lors du calcul du temps écoulé:', error);
    return 'date inconnue';
  }
};
