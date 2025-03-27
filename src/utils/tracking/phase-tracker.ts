
/**
 * Module de suivi des phases d'architecture
 * 
 * Ce module permet de suivre l'évolution des phases d'architecture
 * et de générer des rapports sur l'avancement.
 */

import fs from 'fs';
import path from 'path';

// Types
export interface PhaseProgress {
  phase: number;
  completedIndicators: number;
  totalIndicators: number;
  lastVerification: string;
  verificationResults: any[];
}

export interface PhaseTracking {
  currentPhase: number;
  phases: Record<string, PhaseProgress>;
  projectStartDate: string;
  lastUpdate: string;
}

// Chemins
const ROOT_DIR = path.resolve(__dirname, '../../..');
const TRACKING_FILE = path.join(ROOT_DIR, 'reports', 'phase-tracking.json');

/**
 * Initialise ou récupère les données de suivi des phases
 */
export function getPhaseTracking(): PhaseTracking {
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      const data = fs.readFileSync(TRACKING_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Erreur lors de la lecture du fichier de suivi des phases:', error);
  }
  
  // Valeurs par défaut
  return {
    currentPhase: 2,
    phases: {
      '1': {
        phase: 1,
        completedIndicators: 2,
        totalIndicators: 2,
        lastVerification: new Date().toISOString(),
        verificationResults: []
      },
      '2': {
        phase: 2,
        completedIndicators: 0,
        totalIndicators: 4,
        lastVerification: '',
        verificationResults: []
      },
      '3': {
        phase: 3,
        completedIndicators: 0,
        totalIndicators: 3,
        lastVerification: '',
        verificationResults: []
      }
    },
    projectStartDate: new Date().toISOString(),
    lastUpdate: new Date().toISOString()
  };
}

/**
 * Met à jour les données de suivi avec les résultats d'une vérification
 */
export function updatePhaseTracking(phase: number, verificationResults: any): void {
  const tracking = getPhaseTracking();
  
  // Calculer le nombre d'indicateurs complétés
  const completedIndicators = Object.values(verificationResults.results)
    .filter((result: any) => result.success)
    .length;
  
  const totalIndicators = Object.keys(verificationResults.results).length;
  
  tracking.phases[phase.toString()] = {
    phase,
    completedIndicators,
    totalIndicators,
    lastVerification: new Date().toISOString(),
    verificationResults: [
      ...(tracking.phases[phase.toString()]?.verificationResults || []),
      {
        timestamp: new Date().toISOString(),
        results: verificationResults
      }
    ].slice(-5) // Conserver uniquement les 5 dernières vérifications
  };
  
  tracking.lastUpdate = new Date().toISOString();
  
  // Sauvegarder les données de suivi
  const reportsDir = path.dirname(TRACKING_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2));
}

/**
 * Calcule le pourcentage d'avancement global du projet
 */
export function calculateOverallProgress(): number {
  const tracking = getPhaseTracking();
  
  const phases = Object.values(tracking.phases);
  const totalIndicators = phases.reduce((sum, phase) => sum + phase.totalIndicators, 0);
  const completedIndicators = phases.reduce((sum, phase) => sum + phase.completedIndicators, 0);
  
  return Math.round((completedIndicators / totalIndicators) * 100);
}

/**
 * Génère un rapport HTML sur l'avancement des phases
 */
export function generatePhaseProgressReport(): string {
  const tracking = getPhaseTracking();
  const overallProgress = calculateOverallProgress();
  
  // Générer le HTML pour chaque phase
  const phaseHtml = Object.values(tracking.phases).map(phase => {
    const progress = Math.round((phase.completedIndicators / phase.totalIndicators) * 100);
    const lastVerification = phase.lastVerification 
      ? new Date(phase.lastVerification).toLocaleString()
      : 'Jamais';
    
    return `
      <div class="phase-card ${tracking.currentPhase === phase.phase ? 'current-phase' : ''}">
        <div class="phase-header">
          <h3>Phase ${phase.phase}</h3>
          <span class="phase-status">${progress === 100 ? '✓ Complète' : 'En cours'}</span>
        </div>
        <div class="phase-progress">
          <div class="progress-bar">
            <div class="progress-value" style="width: ${progress}%">${progress}%</div>
          </div>
        </div>
        <div class="phase-details">
          <p>Indicateurs: ${phase.completedIndicators}/${phase.totalIndicators}</p>
          <p>Dernière vérification: ${lastVerification}</p>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Avancement des phases d'architecture</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; color: #333; }
        h1, h2, h3 { color: #2563eb; }
        .header { margin-bottom: 30px; }
        .overall-progress { margin-bottom: 30px; }
        .progress-bar { height: 24px; width: 100%; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden; margin-top: 10px; margin-bottom: 20px; }
        .progress-value { height: 100%; background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .phases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .phase-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .phase-card.current-phase { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
        .phase-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .phase-status { font-size: 0.875rem; font-weight: 500; }
        .phase-details { margin-top: 15px; font-size: 0.875rem; color: #6b7280; }
        .timestamp { color: #6b7280; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Avancement des phases d'architecture</h1>
        <p class="timestamp">Mis à jour le ${new Date(tracking.lastUpdate).toLocaleString()}</p>
      </div>
      
      <div class="overall-progress">
        <h2>Avancement global</h2>
        <div class="progress-bar">
          <div class="progress-value" style="width: ${overallProgress}%">${overallProgress}%</div>
        </div>
      </div>
      
      <h2>Avancement par phase</h2>
      <div class="phases-grid">
        ${phaseHtml}
      </div>
      
      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.875rem;">
        <p>Ce rapport a été généré automatiquement par le système de suivi des phases</p>
        <p>Date de début du projet: ${new Date(tracking.projectStartDate).toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Enregistre un rapport de progression des phases
 */
export function savePhaseProgressReport(): string {
  const report = generatePhaseProgressReport();
  const reportPath = path.join(ROOT_DIR, 'reports', 'phase-progress.html');
  
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report);
  return reportPath;
}
