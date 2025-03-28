
/**
 * Pièce jointe pour diverses entités
 */
export interface Attachment {
  /** Identifiant unique */
  id: string;
  /** Nom du fichier */
  name: string;
  /** URL d'accès à la pièce jointe */
  url: string;
  /** Type MIME */
  type: string;
}
