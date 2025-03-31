
/**
 * Module de chiffrement simplifié pour les tokens Notion
 * 
 * Note: Ce n'est pas une solution de chiffrement robuste - c'est une couche
 * de base pour obfusquer des données sensibles dans le stockage client.
 * Pour une sécurité optimale, utilisez toujours des solutions côté serveur.
 */

// Clé secrète pour le chiffrement (générée à partir du domaine et d'une constante)
const ENCRYPTION_KEY = generateEncryptionKey();

/**
 * Génère une clé d'encryption basée sur des paramètres de l'environnement
 */
function generateEncryptionKey(): string {
  // Utiliser le domaine et une constante pour générer une clé qui change avec le domaine
  const domain = window.location.hostname;
  const constant = "notion_secure_v1";
  
  // Créer une clé dérivée pour chaque domaine
  return `${domain}_${constant}_${domain.length * 7}`;
}

/**
 * Fonction simple de hachage pour générer un entier
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32 bits
  }
  return hash;
}

/**
 * Chiffre une chaîne de caractères
 */
export function encryptData(data: string): string {
  try {
    if (!data) return '';
    
    // Générer un sel basé sur la donnée elle-même
    const salt = simpleHash(data).toString(16);
    
    // Combinaison de la clé et du sel
    const keyWithSalt = ENCRYPTION_KEY + salt;
    
    // Chiffrement basique (XOR + Base64)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyChar = keyWithSalt.charCodeAt(i % keyWithSalt.length);
      encrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    // Encoder en Base64 et ajouter le sel comme préfixe
    const base64 = btoa(encrypted);
    return `${salt}:${base64}`;
  } catch (error) {
    console.error('Erreur de chiffrement:', error);
    return data; // En cas d'échec, retourner la donnée non chiffrée
  }
}

/**
 * Déchiffre une chaîne de caractères
 */
export function decryptData(encryptedData: string): string {
  try {
    if (!encryptedData) return '';
    
    // Extraire le sel et les données
    const [salt, base64] = encryptedData.split(':');
    
    // Si le format n'est pas correct, retourner les données telles quelles
    if (!salt || !base64) return encryptedData;
    
    // Combinaison de la clé et du sel
    const keyWithSalt = ENCRYPTION_KEY + salt;
    
    // Décoder depuis Base64
    const encrypted = atob(base64);
    
    // Déchiffrement (XOR inverse)
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i);
      const keyChar = keyWithSalt.charCodeAt(i % keyWithSalt.length);
      decrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return encryptedData; // En cas d'échec, retourner la donnée chiffrée
  }
}

/**
 * Vérifie si une chaîne semble être chiffrée avec ce module
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;
  
  // Vérifier le format salt:base64
  const parts = data.split(':');
  if (parts.length !== 2) return false;
  
  // Vérifier si le sel est un hexadécimal
  const salt = parts[0];
  const isHex = /^[0-9a-f]+$/i.test(salt);
  
  // Vérifier si la seconde partie est en Base64
  const base64 = parts[1];
  const isBase64 = /^[A-Za-z0-9+/=]+$/.test(base64);
  
  return isHex && isBase64;
}
