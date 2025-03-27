#!/usr/bin/env node

/**
* Script de génération de feature
* 
* Ce script crée la structure complète d'une nouvelle feature
* selon les standards d'architecture du projet.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface pour les arguments de la ligne de commande
interface Arguments {
  featureName: string;
  entityName: string;
  entityNamePlural: string;
  entityDescription: string;
  apiService: string;
  apiServicePath: string;
}

/**
 * Affiche l'aide en ligne
 */
function displayHelp() {
  console.log(`
  Usage: generate-feature --featureName <featureName> --entityName <entityName> --entityNamePlural <entityNamePlural> --entityDescription <entityDescription> --apiService <apiService> --apiServicePath <apiServicePath>

  Options:
    --featureName         Nom de la feature (ex: Projects)
    --entityName          Nom de l'entité (ex: Project)
    --entityNamePlural    Nom de l'entité au pluriel (ex: Projects)
    --entityDescription   Description de l'entité (ex: les projets)
    --apiService          Nom du service API (ex: projectsApi)
    --apiServicePath      Chemin du service API (ex: projects)
    --help                Affiche cette aide
  `);
}

/**
 * Parse les arguments de la ligne de commande
 */
function parseArguments(): Arguments | null {
  const args = process.argv.slice(2);
  const parsedArgs: Partial<Arguments> = {};

  for (let i = 0; i < args.length; i += 2) {
    const argName = args[i].replace('--', '');
    const argValue = args[i + 1];

    switch (argName) {
      case 'featureName':
        parsedArgs.featureName = argValue;
        break;
      case 'entityName':
        parsedArgs.entityName = argValue;
        break;
      case 'entityNamePlural':
        parsedArgs.entityNamePlural = argValue;
        break;
      case 'entityDescription':
        parsedArgs.entityDescription = argValue;
        break;
      case 'apiService':
        parsedArgs.apiService = argValue;
        break;
      case 'apiServicePath':
        parsedArgs.apiServicePath = argValue;
        break;
      case 'help':
        displayHelp();
        process.exit(0);
      default:
        console.error(`Argument inconnu: ${args[i]}`);
        displayHelp();
        process.exit(1);
    }
  }

  if (
    !parsedArgs.featureName ||
    !parsedArgs.entityName ||
    !parsedArgs.entityNamePlural ||
    !parsedArgs.entityDescription ||
    !parsedArgs.apiService ||
    !parsedArgs.apiServicePath
  ) {
    console.error('Tous les arguments sont requis.');
    displayHelp();
    return null;
  }

  return parsedArgs as Arguments;
}

/**
 * Crée un fichier à partir d'un template
 */
function createFileFromTemplate(templatePath: string, outputPath: string, args: Arguments) {
  try {
    let template = fs.readFileSync(templatePath, 'utf8');

    // Remplacer les placeholders
    for (const key in args) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(placeholder, args[key]);
    }

    // Écrire le fichier
    fs.writeFileSync(outputPath, template);
    console.log(`Fichier créé: ${outputPath}`);
  } catch (error) {
    console.error(`Erreur lors de la création du fichier ${outputPath}:`, error);
  }
}

/**
 * Crée la structure de la feature
 */
function createFeatureStructure(args: Arguments) {
  const featureName = args.featureName;
  const featurePath = path.resolve(__dirname, '..', 'features', featureName);

  // Créer le dossier de la feature
  fs.mkdirSync(featurePath, { recursive: true });
  fs.mkdirSync(path.join(featurePath, 'components'), { recursive: true });
  fs.mkdirSync(path.join(featurePath, 'hooks'), { recursive: true });

  // Templates
  const templatesDir = path.resolve(__dirname, '..', 'templates', 'feature');

  // Créer les fichiers
  createFileFromTemplate(
    path.join(templatesDir, 'index.ts.template'),
    path.join(featurePath, 'index.ts'),
    args
  );

  createFileFromTemplate(
    path.join(templatesDir, 'types.ts.template'),
    path.join(featurePath, 'types.ts'),
    args
  );
}

/**
 * Point d'entrée principal
 */
function main() {
  const args = parseArguments();

  if (!args) {
    process.exit(1);
  }

  createFeatureStructure(args);
}

main();
