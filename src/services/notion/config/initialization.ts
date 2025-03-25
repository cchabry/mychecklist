
/**
 * Gestion de l'initialisation de la configuration
 * S'occupe du chargement, de la validation et de l'application de la configuration au démarrage
 */

import { getStoredConfig, updateConfig, isConfigValid, NotionConfig } from './index';
import { initializeFromEnvironment, validateEnvironmentConfig } from './environment';

// État de validation de la configuration
export interface ConfigValidationState {
  valid: boolean;
  missingRequired: string[];
  warnings: string[];
  loadedFrom: 'localStorage' | 'environment' | 'defaults' | 'mixed';
}

/**
 * Initialise la configuration au démarrage de l'application
 * Priorise la configuration stockée, puis les variables d'environnement, puis les valeurs par défaut
 */
export function initializeConfiguration(options: {
  prioritizeEnvironment?: boolean;
  validateOnly?: boolean;
  silent?: boolean;
} = {}): ConfigValidationState {
  const { prioritizeEnvironment = false, validateOnly = false, silent = false } = options;
  
  // Vérifier la configuration stockée
  const storedConfig = getStoredConfig();
  const storedValid = isConfigValid(storedConfig);
  
  // Vérifier les variables d'environnement
  const envConfig = initializeFromEnvironment();
  const missingEnvVars = validateEnvironmentConfig();
  const envValid = missingEnvVars.length === 0;
  
  // Déterminer la source de configuration à utiliser
  let configSource: 'localStorage' | 'environment' | 'defaults' | 'mixed' = 'defaults';
  let warnings: string[] = [];
  
  if (storedValid && !prioritizeEnvironment) {
    configSource = 'localStorage';
    if (!silent) console.log('✅ Utilisation de la configuration stockée dans localStorage');
    
    // Ajouter un avertissement si des variables d'environnement sont disponibles mais ignorées
    if (envValid) {
      warnings.push(
        'Des variables d\'environnement valides sont disponibles mais ignorées car une configuration valide existe dans localStorage'
      );
    }
  } else if (envValid) {
    configSource = 'environment';
    if (!silent) console.log('✅ Utilisation de la configuration depuis les variables d\'environnement');
    
    // Ajouter un avertissement si une configuration stockée est disponible mais ignorée
    if (storedValid) {
      warnings.push(
        'Une configuration localStorage valide est disponible mais ignorée car priorité donnée aux variables d\'environnement'
      );
    }
  } else if (storedValid) {
    configSource = 'localStorage';
    if (!silent) console.log('✅ Utilisation de la configuration stockée par défaut');
    warnings.push('Variables d\'environnement incomplètes, utilisation de localStorage à la place');
  } else {
    configSource = 'mixed';
    if (!silent) console.warn('⚠️ Configuration incomplète, utilisation d\'une combinaison de sources');
    
    // Ajouter les problèmes détectés
    if (missingEnvVars.length > 0) {
      warnings.push(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
    }
    if (!storedConfig.apiKey) {
      warnings.push('Clé API Notion manquante dans localStorage');
    }
    if (!storedConfig.databaseIds.projects) {
      warnings.push('ID de base de données des projets manquant dans localStorage');
    }
  }
  
  // Si on ne fait que valider, ne pas appliquer les changements
  if (validateOnly) {
    return {
      valid: storedValid || envValid,
      missingRequired: [...missingEnvVars],
      warnings,
      loadedFrom: configSource
    };
  }
  
  // Appliquer la configuration
  if (configSource === 'environment' || (configSource === 'mixed' && prioritizeEnvironment)) {
    // Mettre à jour la configuration stockée avec les valeurs de l'environnement
    updateConfig(envConfig);
  }
  
  return {
    valid: storedValid || envValid,
    missingRequired: [...missingEnvVars],
    warnings,
    loadedFrom: configSource
  };
}

/**
 * Réinitialise la configuration en fonction des variables d'environnement
 * Écrase les valeurs stockées dans localStorage
 */
export function resetConfigurationFromEnvironment(): ConfigValidationState {
  // Récupérer la configuration depuis l'environnement
  const envConfig = initializeFromEnvironment();
  
  // Appliquer la configuration
  updateConfig(envConfig);
  
  // Valider la nouvelle configuration
  const missingEnvVars = validateEnvironmentConfig();
  const valid = missingEnvVars.length === 0;
  
  return {
    valid,
    missingRequired: [...missingEnvVars],
    warnings: [],
    loadedFrom: 'environment'
  };
}

/**
 * Valide une configuration en vérifiant les champs requis
 */
export function validateConfiguration(config: NotionConfig): {
  valid: boolean;
  missingRequired: string[];
} {
  const missingRequired: string[] = [];
  
  if (!config.apiKey) {
    missingRequired.push('API Key');
  }
  
  if (!config.databaseIds.projects) {
    missingRequired.push('Database Projects ID');
  }
  
  return {
    valid: missingRequired.length === 0,
    missingRequired
  };
}

// Exporter des utilitaires pratiques
export const configUtils = {
  initialize: initializeConfiguration,
  reset: resetConfigurationFromEnvironment,
  validate: validateConfiguration
};

// Exporter l'état de la configuration courante
export const configState = initializeConfiguration({ validateOnly: true, silent: true });
