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
