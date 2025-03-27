
/**
 * Générateur de rapports pour l'analyse d'architecture
 */
import fs from 'fs';
import path from 'path';
import { PhaseVerificationResult } from '../types';
import { formatTimestampForFilename, generateMarkdownReport } from './formatters';
import { getReportsDirectory } from '../utils';

/**
 * Génère un rapport de vérification de phase et l'enregistre dans un fichier
 */
export function generateReport(
  phaseIndex: number, 
  phaseName: string, 
  result: PhaseVerificationResult
): string {
  const reportsDir = getReportsDirectory();
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = formatTimestampForFilename();
  const reportPath = path.join(reportsDir, `phase-${phaseIndex + 1}-report-${timestamp}.md`);
  
  const reportContent = generateMarkdownReport(phaseName, result);
  
  fs.writeFileSync(reportPath, reportContent);
  
  return reportPath;
}
