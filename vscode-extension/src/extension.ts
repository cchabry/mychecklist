
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { analyzeFile, ArchitectureIssue } from './analyzer';

// Stockage des problèmes détectés
const diagnosticCollection = vscode.languages.createDiagnosticCollection('architecture');

/**
 * Active l'extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "Architecture Analyzer" activée');

  // Commande pour analyser manuellement
  const analyzeCommand = vscode.commands.registerCommand('architecture-analyzer.analyze', () => {
    analyzeCurrentFile();
    vscode.window.showInformationMessage('Analyse d\'architecture effectuée');
  });

  // Commande pour afficher le tableau de bord
  const showDashboardCommand = vscode.commands.registerCommand('architecture-analyzer.showDashboard', () => {
    openDashboard();
  });

  // Analyser le fichier actif lors de l'ouverture ou de la modification
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && isTypeScriptFile(editor.document)) {
        analyzeEditor(editor);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(document => {
      if (isTypeScriptFile(document)) {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === document) {
          analyzeEditor(editor);
        }
      }
    })
  );

  // Analyser le fichier actif s'il est déjà ouvert
  if (vscode.window.activeTextEditor) {
    analyzeEditor(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(analyzeCommand, showDashboardCommand, diagnosticCollection);
}

/**
 * Vérifie si un document est un fichier TypeScript
 */
function isTypeScriptFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'typescript' || document.languageId === 'typescriptreact';
}

/**
 * Analyse le fichier actuellement ouvert dans l'éditeur
 */
function analyzeCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    analyzeEditor(editor);
  } else {
    vscode.window.showWarningMessage('Aucun fichier ouvert à analyser');
  }
}

/**
 * Analyse le contenu d'un éditeur
 */
function analyzeEditor(editor: vscode.TextEditor) {
  const document = editor.document;
  if (!isTypeScriptFile(document)) {
    return;
  }

  const config = vscode.workspace.getConfiguration('architectureAnalyzer');
  if (!config.get('enableLinting')) {
    return;
  }

  const filePath = document.fileName;
  const fileContent = document.getText();
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

  if (!workspaceFolder) {
    return;
  }

  // Convertir le chemin absolu en chemin relatif au projet
  const relativeFilePath = path.relative(workspaceFolder.uri.fsPath, filePath);

  // Analyser le fichier
  const issues = analyzeFile(relativeFilePath, fileContent);
  updateDiagnostics(document, issues);
}

/**
 * Met à jour les diagnostics pour un document
 */
function updateDiagnostics(document: vscode.TextDocument, issues: ArchitectureIssue[]) {
  const diagnostics: vscode.Diagnostic[] = [];
  const config = vscode.workspace.getConfiguration('architectureAnalyzer');
  const severityLevel = config.get('severityLevel');

  // Convertir le niveau de sévérité
  let severity = vscode.DiagnosticSeverity.Warning;
  switch (severityLevel) {
    case 'error':
      severity = vscode.DiagnosticSeverity.Error;
      break;
    case 'information':
      severity = vscode.DiagnosticSeverity.Information;
      break;
    case 'hint':
      severity = vscode.DiagnosticSeverity.Hint;
      break;
  }

  // Créer un diagnostic pour chaque problème
  for (const issue of issues) {
    const lineIndex = issue.line !== undefined ? issue.line : 0;
    const line = document.lineAt(lineIndex);
    const range = new vscode.Range(
      lineIndex, 0,
      lineIndex, line.text.length
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      issue.message,
      severity
    );
    diagnostic.source = 'Architecture Analyzer';
    diagnostic.code = issue.code || 'architecture-issue';
    diagnostics.push(diagnostic);
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

/**
 * Ouvre le tableau de bord d'architecture
 */
function openDashboard() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('Aucun dossier de travail ouvert');
    return;
  }

  const dashboardPath = path.join(
    workspaceFolders[0].uri.fsPath,
    'reports',
    'architecture-dashboard.html'
  );

  if (!fs.existsSync(dashboardPath)) {
    vscode.window.showErrorMessage('Tableau de bord non trouvé. Exécutez d\'abord l\'analyse d\'architecture.');
    return;
  }

  // Ouvrir le tableau de bord dans un nouvel onglet
  vscode.commands.executeCommand('vscode.open', vscode.Uri.file(dashboardPath));
}

/**
 * Désactive l'extension
 */
export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
}
