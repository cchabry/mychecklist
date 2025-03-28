
/**
 * Type pour les pièces jointes
 */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  createdAt?: string;
}
