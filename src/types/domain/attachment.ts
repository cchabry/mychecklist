
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
   * Taille du fichier en octets
   */
  size?: number;
  
  /**
   * Date d'ajout de la pièce jointe (au format ISO)
   */
  createdAt?: string;
}
