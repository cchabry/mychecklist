
/**
 * Indicateurs relatifs à la gestion des erreurs
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { getCurrentDirectory } from '../utils';

const __dirname = getCurrentDirectory();

/**
 * Vérifie que la gestion d'erreurs est standardisée
 */
export async function checkStandardErrorHandling(): Promise<boolean> {
  // Vérifier l'existence et l'utilisation de errorUtils.ts
  const errorUtilsPath = path.join(__dirname, '../../../utils/error/errorUtils.ts');
  if (!fs.existsSync(errorUtilsPath)) return false;
  
  // Vérifier que le hook useErrorHandler est utilisé dans les services
  const errorHookPath = path.join(__dirname, '../../../hooks/error/useErrorHandler.ts');
  if (!fs.existsSync(errorHookPath)) return false;
  
  // Vérifier l'utilisation dans au moins un service
  const serviceFiles = await glob(path.join(__dirname, '../../../services/**/*.ts'));
  let usageCount = 0;
  
  for (const file of serviceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('handleError') || content.includes('useErrorHandler')) {
      usageCount++;
    }
  }
  
  return usageCount >= 2; // Au moins deux services utilisent la gestion d'erreurs
}
