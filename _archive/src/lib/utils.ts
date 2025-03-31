
/**
 * Utilitaire pour fusionner des classes Tailwind conditionnellement
 * Utilisé principalement par les composants shadcn/ui
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Nettoie l'ID d'un audit en retirant les préfixes "audit_" ou "audit-"
 * @param id Identifiant d'audit possiblement préfixé
 * @returns Identifiant d'audit nettoyé
 */
export function cleanAuditId(id: string): string {
  if (!id) return id;
  
  if (id.startsWith('audit_') || id.startsWith('audit-')) {
    const match = id.match(/(?:audit_|audit-)(.+)/);
    if (match && match[1]) {
      console.log(`Nettoyage de l'ID d'audit: ${id} -> ${match[1]}`);
      return match[1];
    }
  }
  
  return id;
}

/**
 * Nettoie l'ID d'un projet en retirant les guillemets et autres caractères non désirés
 * @param id Identifiant du projet possiblement encapsulé dans des guillemets
 * @returns Identifiant du projet nettoyé
 */
export function cleanProjectId(id?: string): string {
  if (!id) return '';
  
  console.log(`cleanProjectId: "${id}" -> "${id.replace(/"/g, '')}"`);
  
  // Retirer les guillemets si présents
  return id.replace(/"/g, '');
}

/**
 * Réinitialise l'état global de l'application 
 * (préférences, configurations, cache, etc.)
 */
export function resetApplicationState() {
  // Suppression des clés de stockage local liées à l'application
  const keysToRemove = [
    'notion_api_key',
    'notion_mock_mode',
    'notion_force_real',
    'notion_databases_config',
    'notion_last_projects',
    'cors_proxy_config'
  ];
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`Clé ${key} supprimée du stockage local`);
    } catch (err) {
      console.error(`Erreur lors de la suppression de la clé ${key}:`, err);
    }
  });
  
  // Rafraîchir la page pour réinitialiser l'état de l'application
  console.log("État de l'application réinitialisé");
}
