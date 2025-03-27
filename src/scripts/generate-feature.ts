#!/usr/bin/env node;
/**
 * Script de génération de feature
 * 
 * Ce script génère une nouvelle feature conforme à l'architecture
 * à partir des templates.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const TEMPLATES_DIR = path.resolve(__dirname, '../templates/feature');
const FEATURES_DIR = path.resolve(__dirname, '../features');

// Interface pour les entrées utilisateur
interface FeatureInfo {
  featureName: string;
  featureDescription: string;
  entityName: string;
  entityNamePlural: string;
  entityType: string;
  apiService: string;
  apiServicePath: string;
}

// Créer l'interface de ligne de commande
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Capitalise la première lettre d'une chaîne
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Remplace les placeholders dans un contenu de template
 */
function replaceTemplateVariables(content: string, info: FeatureInfo): string {
  return content
    .replace(/\{\{featureName\}\}/g, info.featureName)
    .replace(/\{\{featureDescription\}\}/g, info.featureDescription)
    .replace(/\{\{entityName\}\}/g, info.entityName)
    .replace(/\{\{entityNamePlural\}\}/g, info.entityNamePlural)
    .replace(/\{\{entityType\}\}/g, info.entityType)
    .replace(/\{\{EntityType\}\}/g, capitalize(info.entityType))
    .replace(/\{\{EntityName\}\}/g, capitalize(info.entityName))
    .replace(/\{\{EntityNamePlural\}\}/g, capitalize(info.entityNamePlural))
    .replace(/\{\{apiService\}\}/g, info.apiService)
    .replace(/\{\{apiServicePath\}\}/g, info.apiServicePath);
}

/**
 * Crée un dossier de manière récursive
 */
function createDirectoryRecursive(targetDir: string): void {
  if (fs.existsSync(targetDir)) return;
  
  createDirectoryRecursive(path.dirname(targetDir));
  fs.mkdirSync(targetDir);
}

/**
 * Génère tous les fichiers pour une feature
 */
function generateFeatureFiles(info: FeatureInfo): void {
  const featureDir = path.join(FEATURES_DIR, info.featureName);
  
  // Vérifier si la feature existe déjà
  if (fs.existsSync(featureDir)) {
    console.error(`Erreur: La feature '${info.featureName}' existe déjà.`);
    process.exit(1);
  }
  
  // Créer les répertoires nécessaires
  createDirectoryRecursive(path.join(featureDir, 'components'));
  createDirectoryRecursive(path.join(featureDir, 'hooks'));
  
  // Parcourir tous les templates et générer les fichiers
  processTemplateDirectory(TEMPLATES_DIR, featureDir, info);
  
  console.log(`✅ Feature '${info.featureName}' générée avec succès dans ${featureDir}`);
}

/**
 * Traite récursivement un répertoire de templates
 */
function processTemplateDirectory(templateDir: string, targetDir: string, info: FeatureInfo): void {
  const templateFiles = fs.readdirSync(templateDir);
  
  for (const templateFile of templateFiles) {
    const templatePath = path.join(templateDir, templateFile);
    const stat = fs.statSync(templatePath);
    
    if (stat.isDirectory()) {
      // Récursion pour les sous-répertoires
      const nestedTargetDir = path.join(targetDir, templateFile);
      createDirectoryRecursive(nestedTargetDir);
      processTemplateDirectory(templatePath, nestedTargetDir, info);
    } else {
      // Traiter le fichier template
      let targetFileName = templateFile.replace('.template', '');
      
      // Remplacer les variables dans le nom du fichier
      targetFileName = replaceTemplateVariables(targetFileName, info);
      
      const targetPath = path.join(targetDir, targetFileName);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const processedContent = replaceTemplateVariables(templateContent, info);
      
      fs.writeFileSync(targetPath, processedContent);
      console.log(`Fichier créé: ${targetPath}`);
    }
  }
}

/**
 * Collecte les informations de feature via l'interface utilisateur
 */
function collectFeatureInfo(): Promise<FeatureInfo> {
  return new Promise((resolve) => {
    const info: Partial<FeatureInfo> = {};
    
    rl.question('Nom de la feature (camelCase): ', (featureName) => {
      info.featureName = featureName;
      
      rl.question('Description de la feature: ', (featureDescription) => {
        info.featureDescription = featureDescription;
        
        rl.question('Nom de l\'entité principale (singulier, camelCase): ', (entityName) => {
          info.entityName = entityName;
          
          rl.question('Nom de l\'entité principale (pluriel, camelCase): ', (entityNamePlural) => {
            info.entityNamePlural = entityNamePlural;
            
            rl.question('Type de l\'entité (PascalCase): ', (entityType) => {
              info.entityType = entityType;
              
              rl.question('Nom du service API (ex: auditsApi): ', (apiService) => {
                info.apiService = apiService;
                
                rl.question('Chemin du service API (ex: audits): ', (apiServicePath) => {
                  info.apiServicePath = apiServicePath;
                  
                  rl.close();
                  resolve(info as FeatureInfo);
                });
              });
            });
          });
        });
      });
    });
  });
}

/**
 * Point d'entrée principal
 */
async function main(): Promise<void> {
  console.log('Générateur de feature conforme à l\'architecture');
  console.log('==============================================');
  
  try {
    const featureInfo = await collectFeatureInfo();
    generateFeatureFiles(featureInfo);
  } catch (error) {
    console.error('Erreur lors de la génération de la feature:', error);
    process.exit(1);
  }
}

main();
