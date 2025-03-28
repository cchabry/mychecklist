
/**
 * Type pour les pièces jointes
 */

export interface Attachment {
  /** Identifiant unique de la pièce jointe */
  id: string;
  
  /** Type de fichier */
  fileType: string;
  
  /** Nom du fichier */
  fileName: string;
  
  /** URL de la pièce jointe */
  url: string;
  
  /** Taille du fichier en octets */
  size?: number;
  
  /** Date de création */
  createdAt: string;
  
  /** Description ou légende (facultatif) */
  description?: string;
}

export default Attachment;
