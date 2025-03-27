
/**
 * Utilitaires pour le système de vérification d'architecture
 */
import path from 'path';
import { fileURLToPath } from 'url';

// Obtention du répertoire courant en mode ESM
export const getCurrentDirectory = () => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};

// Chemin vers la racine du projet
export const getProjectRoot = () => {
  const currentDir = getCurrentDirectory();
  return path.resolve(currentDir, '../../..');
};

// Chemin vers le répertoire src
export const getSrcDirectory = () => {
  return path.join(getProjectRoot(), 'src');
};

// Chemin vers le répertoire de rapports
export const getReportsDirectory = () => {
  return path.join(getProjectRoot(), 'reports');
};
