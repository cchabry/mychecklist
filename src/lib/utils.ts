export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formate une date et heure en format français lisible.
 * @param dateString La date au format ISO string.
 * @returns Une chaîne de caractères représentant la date et l'heure formatées.
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Nettoie l'ID d'un projet Notion.
 * Gère les cas où l'ID est enveloppé dans une chaîne JSON ou contient des tirets.
 */
export const cleanProjectId = (id?: string): string => {
  if (!id) return '';
  
  // Si l'ID est une chaîne JSON, l'extraire
  if (id.startsWith('"') && id.endsWith('"')) {
    try {
      id = JSON.parse(id);
    } catch (e) {
      console.error('Erreur lors du parsing de l\'ID:', e);
    }
  }
  
  // Supprimer les tirets si présents
  return id.replace(/[-]/g, '');
};
