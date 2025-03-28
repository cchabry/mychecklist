
/**
 * Types pour les pièces jointes
 */

/**
 * Interface pour une pièce jointe
 * 
 * Une pièce jointe représente un fichier lié à une évaluation
 * (capture d'écran, document, etc.).
 */
export interface Attachment {
  /**
   * Identifiant unique de la pièce jointe
   */
  id: string;
  
  /**
   * Nom du fichier
   * @deprecated Utiliser fileName à la place
   */
  name?: string;
  
  /**
   * Nom du fichier
   */
  fileName: string;
  
  /**
   * URL de la pièce jointe
   */
  url: string;
  
  /**
   * Type MIME de la pièce jointe
   */
  contentType?: string;
  
  /**
   * Type de la pièce jointe (pour la rétrocompatibilité)
   */
  type?: string;
  
  /**
   * Taille du fichier en octets
   */
  size?: number;
  
  /**
   * Date d'ajout de la pièce jointe (au format ISO)
   */
  createdAt?: string;
}

// Fonction utilitaire pour convertir l'ancien format vers le nouveau
export function migrateAttachment(oldAttachment: {id: string, name: string, url: string, type: string}): Attachment {
  return {
    id: oldAttachment.id,
    fileName: oldAttachment.name,
    name: oldAttachment.name,
    url: oldAttachment.url,
    type: oldAttachment.type,
  };
}
