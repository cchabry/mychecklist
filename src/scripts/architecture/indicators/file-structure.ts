
/**
 * Indicateurs relatifs à la structure des fichiers
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { getCurrentDirectory } from '../utils';

const __dirname = getCurrentDirectory();

/**
 * Vérifie la séparation entre le client HTTP et le service API Notion
 */
export async function checkClientApiSeparation(): Promise<boolean> {
  // Vérifier que notionHttpClient.ts et notionApiImpl.ts existent et ont des responsabilités distinctes
  const clientExists = fs.existsSync(path.join(__dirname, '../../../services/notion/client/notionHttpClient.ts'));
  const apiImplExists = fs.existsSync(path.join(__dirname, '../../../services/notion/notionApiImpl.ts'));
  return clientExists && apiImplExists;
}

/**
 * Vérifie qu'il existe un client unifié pour l'API Notion (réel ou démo)
 */
export async function checkUnifiedClient(): Promise<boolean> {
  // Vérifier que notionClient.ts contient la logique de sélection réel/démo
  const clientPath = path.join(__dirname, '../../../services/notion/client/notionClient.ts');
  if (!fs.existsSync(clientPath)) return false;
  
  const content = fs.readFileSync(clientPath, 'utf8');
  return content.includes('isMockMode') && 
         content.includes('notionHttpClient') && 
         content.includes('notionMockClient');
}

/**
 * Vérifie que les couches d'abstraction sont réduites dans l'API Notion
 */
export async function checkAbstractionLayers(): Promise<boolean> {
  // Compter le nombre de fichiers dans le dossier services/notion
  const notionDir = path.join(__dirname, '../../../services/notion');
  const files = await glob(path.join(notionDir, '**/*.ts'));
  const fileCount = files.length;
  
  // Une bonne architecture ne devrait pas avoir trop de fichiers pour le même domaine
  return fileCount <= 15; // Seuil à ajuster selon l'objectif précis
}

/**
 * Vérifie la coordination avec le mode opérationnel
 */
export async function checkOperationModeCoordination(): Promise<boolean> {
  // Vérifier que les services Notion utilisent useOperationMode
  const notionFilePath = path.join(__dirname, '../../../services/notion/client/notionClient.ts');
  if (!fs.existsSync(notionFilePath)) return false;
  
  const content = fs.readFileSync(notionFilePath, 'utf8');
  return content.includes('useOperationMode') || 
         content.includes('isDemoMode');
}
