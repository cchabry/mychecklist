
/**
 * Types pour les pages échantillons
 * 
 * Ce module définit les types de données pour représenter les pages
 * qui feront partie de l'échantillon à auditer pour chaque projet.
 */

/**
 * Interface pour une page échantillon
 * 
 * Une page échantillon représente une URL spécifique d'un projet
 * qui sera évaluée lors des audits.
 */
export interface SamplePage {
  /**
   * Identifiant unique de la page
   */
  id: string;
  
  /**
   * Identifiant du projet auquel appartient cette page
   */
  projectId: string;
  
  /**
   * URL de la page
   */
  url: string;
  
  /**
   * Titre ou nom de la page
   */
  title: string;
  
  /**
   * Nom court de la page (alias pour title, pour la compatibilité)
   */
  name?: string;
  
  /**
   * Description ou contexte de la page
   */
  description?: string;
  
  /**
   * Ordre d'affichage dans la liste des pages échantillons
   */
  order?: number;
  
  /**
   * Date de création de la page (au format ISO)
   */
  createdAt?: string;
  
  /**
   * Date de dernière modification de la page (au format ISO)
   */
  updatedAt?: string;
}
