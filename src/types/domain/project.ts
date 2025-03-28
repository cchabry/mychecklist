
/**
 * Types pour les projets
 * 
 * Ce module définit les types de données pour représenter les projets
 * à auditer dans l'application.
 */

import { ProjectStatus } from '../enums';

/**
 * Interface pour un projet
 * 
 * Un projet représente un site web ou une application à auditer.
 * Il contient des informations de base et peut être lié à des audits,
 * des pages échantillons, et des exigences.
 */
export interface Project {
  /**
   * Identifiant unique du projet
   */
  id: string;
  
  /**
   * Nom du projet
   */
  name: string;
  
  /**
   * URL du projet (site web à auditer)
   */
  url?: string;
  
  /**
   * Description ou notes concernant le projet
   */
  description?: string;
  
  /**
   * Statut du projet
   */
  status?: ProjectStatus;
  
  /**
   * Pourcentage d'avancement du projet (0-100)
   */
  progress?: number;
  
  /**
   * Date de création du projet (au format ISO)
   */
  createdAt: string;
  
  /**
   * Date de dernière modification du projet (au format ISO)
   */
  updatedAt: string;
  
  /**
   * Date du dernier audit réalisé sur ce projet
   */
  lastAuditDate?: string;
}
