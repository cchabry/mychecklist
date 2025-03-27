
/**
 * Configuration des règles d'analyse architecturale
 * 
 * Ce module définit les règles d'analyse et les seuils de conformité
 * qui peuvent être personnalisés selon les besoins du projet.
 */

// Types pour les règles et seuils
export interface ArchitectureRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'structure' | 'naming' | 'exports' | 'imports' | 'types' | 'interface' | 'convention' | 'performance';
  domain?: string; // Domaine spécifique auquel s'applique la règle (optionnel)
  checkFn?: (data: any) => boolean; // Fonction pour vérifier si la règle est respectée
}

export interface ComplianceThreshold {
  id: string;
  name: string;
  description: string;
  category: string;
  domain?: string; // Domaine spécifique auquel s'applique le seuil (optionnel)
  defaultValue: number;
  currentValue: number;
  minValue: number;
  maxValue: number;
}

// Anti-patterns généraux à détecter
export const antiPatterns: ArchitectureRule[] = [
  {
    id: 'no-circular-dependencies',
    name: 'Absence de dépendances circulaires',
    description: 'Vérifie qu\'il n\'y a pas de dépendances circulaires entre les modules',
    enabled: true,
    severity: 'high',
    category: 'imports'
  },
  {
    id: 'consistent-exports',
    name: 'Exports cohérents',
    description: 'Vérifie que les exports sont cohérents dans les fichiers index.ts',
    enabled: true,
    severity: 'medium',
    category: 'exports'
  },
  {
    id: 'typed-props',
    name: 'Props typées',
    description: 'Vérifie que les composants ont des props correctement typées',
    enabled: true,
    severity: 'high',
    category: 'types'
  },
  {
    id: 'hooks-naming',
    name: 'Nommage des hooks',
    description: 'Vérifie que les hooks commencent par "use" et suivent les conventions',
    enabled: true,
    severity: 'medium',
    category: 'naming'
  },
  {
    id: 'feature-structure',
    name: 'Structure des features',
    description: 'Vérifie que les features suivent la structure recommandée',
    enabled: true,
    severity: 'medium',
    category: 'structure'
  },
  {
    id: 'single-responsibility',
    name: 'Principe de responsabilité unique',
    description: 'Vérifie que les fichiers ont une seule responsabilité (taille max)',
    enabled: true,
    severity: 'medium',
    category: 'convention'
  },
  {
    id: 'service-interface',
    name: 'Interface des services',
    description: 'Vérifie que les services ont une interface bien définie',
    enabled: true,
    severity: 'medium',
    category: 'interface'
  },
  {
    id: 'no-any-types',
    name: 'Pas de types any',
    description: 'Vérifie qu\'il n\'y a pas de types any non explicitement justifiés',
    enabled: true,
    severity: 'medium',
    category: 'types'
  },
  {
    id: 'consistent-error-handling',
    name: 'Gestion cohérente des erreurs',
    description: 'Vérifie que les erreurs sont gérées de manière cohérente',
    enabled: true,
    severity: 'high',
    category: 'convention'
  },
  {
    id: 'no-direct-notion-api',
    name: 'Pas d\'appel direct à l\'API Notion',
    description: 'Vérifie qu\'il n\'y a pas d\'appel direct à l\'API Notion en dehors des services dédiés',
    enabled: true,
    severity: 'high',
    category: 'convention'
  }
];

// Règles spécifiques au projet d'audit
export const projectSpecificRules: ArchitectureRule[] = [
  {
    id: 'checklist-naming-convention',
    name: 'Convention de nommage des items de checklist',
    description: 'Vérifie que les items de checklist suivent la convention de nommage établie',
    enabled: true,
    severity: 'medium',
    category: 'naming',
    domain: 'checklist'
  },
  {
    id: 'audit-validation',
    name: 'Validation des données d\'audit',
    description: 'Vérifie que les audits utilisent des fonctions de validation appropriées',
    enabled: true,
    severity: 'high',
    category: 'convention',
    domain: 'audit'
  },
  {
    id: 'project-data-integrity',
    name: 'Intégrité des données de projet',
    description: 'Vérifie que les projets maintiennent l\'intégrité des relations entre entités',
    enabled: true,
    severity: 'high',
    category: 'convention',
    domain: 'project'
  },
  {
    id: 'exigence-consistency',
    name: 'Cohérence des exigences',
    description: 'Vérifie que les exigences sont définies de manière cohérente',
    enabled: true,
    severity: 'medium',
    category: 'convention',
    domain: 'exigence'
  },
  {
    id: 'evaluation-score-validation',
    name: 'Validation des scores d\'évaluation',
    description: 'Vérifie que les scores d\'évaluation utilisent l\'enum ScoreType',
    enabled: true,
    severity: 'medium',
    category: 'types',
    domain: 'evaluation'
  },
  {
    id: 'action-plan-validation',
    name: 'Validation du plan d\'action',
    description: 'Vérifie que les actions correctives sont correctement validées',
    enabled: true,
    severity: 'medium',
    category: 'convention',
    domain: 'action'
  },
  {
    id: 'notion-connection-error-handling',
    name: 'Gestion des erreurs de connexion Notion',
    description: 'Vérifie que les erreurs de connexion à Notion sont gérées correctement',
    enabled: true,
    severity: 'critical',
    category: 'convention',
    domain: 'notion'
  },
  {
    id: 'sample-page-url-validation',
    name: 'Validation des URLs des pages d\'échantillon',
    description: 'Vérifie que les URLs des pages d\'échantillon sont validées',
    enabled: true,
    severity: 'medium',
    category: 'convention',
    domain: 'samplePage'
  }
];

// Seuils de conformité généraux
export const complianceThresholds: ComplianceThreshold[] = [
  {
    id: 'overall-compliance',
    name: 'Conformité globale',
    description: 'Seuil minimal de conformité globale du projet',
    category: 'global',
    defaultValue: 80,
    currentValue: 80,
    minValue: 0,
    maxValue: 100
  },
  {
    id: 'critical-issues',
    name: 'Problèmes critiques',
    description: 'Nombre maximal de problèmes critiques autorisés',
    category: 'issues',
    defaultValue: 0,
    currentValue: 0,
    minValue: 0,
    maxValue: 100
  },
  {
    id: 'high-issues',
    name: 'Problèmes importants',
    description: 'Nombre maximal de problèmes importants autorisés',
    category: 'issues',
    defaultValue: 5,
    currentValue: 5,
    minValue: 0,
    maxValue: 100
  },
  {
    id: 'file-size',
    name: 'Taille maximale des fichiers',
    description: 'Nombre maximal de lignes par fichier',
    category: 'structure',
    defaultValue: 300,
    currentValue: 300,
    minValue: 100,
    maxValue: 1000
  },
  {
    id: 'component-complexity',
    name: 'Complexité des composants',
    description: 'Complexité cyclomatique maximale des composants',
    category: 'performance',
    defaultValue: 15,
    currentValue: 15,
    minValue: 5,
    maxValue: 30
  }
];

// Seuils de conformité par domaine
export const domainSpecificThresholds: ComplianceThreshold[] = [
  {
    id: 'audit-completion-rate',
    name: 'Taux de complétion des audits',
    description: 'Pourcentage minimal de complétion des audits',
    category: 'completion',
    domain: 'audit',
    defaultValue: 90,
    currentValue: 90,
    minValue: 50,
    maxValue: 100
  },
  {
    id: 'project-documentation',
    name: 'Documentation des projets',
    description: 'Score minimal de documentation des projets',
    category: 'documentation',
    domain: 'project',
    defaultValue: 80,
    currentValue: 80,
    minValue: 50,
    maxValue: 100
  },
  {
    id: 'action-correction-rate',
    name: 'Taux de correction des actions',
    description: 'Pourcentage minimal d\'actions correctives complétées',
    category: 'correction',
    domain: 'action',
    defaultValue: 75,
    currentValue: 75,
    minValue: 0,
    maxValue: 100
  },
  {
    id: 'checklist-coverage',
    name: 'Couverture des checklists',
    description: 'Pourcentage minimal d\'items de checklist couverts par les exigences',
    category: 'coverage',
    domain: 'checklist',
    defaultValue: 85,
    currentValue: 85,
    minValue: 50,
    maxValue: 100
  },
  {
    id: 'evaluation-consistency',
    name: 'Cohérence des évaluations',
    description: 'Score minimal de cohérence entre les évaluations',
    category: 'consistency',
    domain: 'evaluation',
    defaultValue: 90,
    currentValue: 90,
    minValue: 70,
    maxValue: 100
  },
  {
    id: 'notion-api-call-limit',
    name: 'Limite d\'appels à l\'API Notion',
    description: 'Nombre maximal d\'appels directs à l\'API Notion',
    category: 'performance',
    domain: 'notion',
    defaultValue: 10,
    currentValue: 10,
    minValue: 0,
    maxValue: 100
  }
];

// Fonction pour récupérer toutes les règles (générales et spécifiques au projet)
export function getAllRules(): ArchitectureRule[] {
  return [...antiPatterns, ...projectSpecificRules];
}

// Fonction pour récupérer les règles par domaine
export function getRulesByDomain(domain?: string): ArchitectureRule[] {
  if (!domain) {
    return antiPatterns; // Règles générales
  }
  return projectSpecificRules.filter(rule => rule.domain === domain);
}

// Fonction pour récupérer tous les seuils de conformité (généraux et par domaine)
export function getAllThresholds(): ComplianceThreshold[] {
  return [...complianceThresholds, ...domainSpecificThresholds];
}

// Fonction pour récupérer les seuils par domaine
export function getThresholdsByDomain(domain?: string): ComplianceThreshold[] {
  if (!domain) {
    return complianceThresholds; // Seuils généraux
  }
  return domainSpecificThresholds.filter(threshold => threshold.domain === domain);
}

// Fonction pour obtenir un seuil spécifique (général ou par domaine)
export function getThreshold(id: string, domain?: string): number {
  const thresholds = getAllThresholds();
  let threshold;
  
  if (domain) {
    // Chercher d'abord un seuil spécifique au domaine
    threshold = thresholds.find(t => t.id === id && t.domain === domain);
  }
  
  // Si pas trouvé avec le domaine (ou pas de domaine spécifié), chercher un seuil général
  if (!threshold) {
    threshold = thresholds.find(t => t.id === id && !t.domain);
  }
  
  return threshold ? threshold.currentValue : 0;
}

// Fonction pour mettre à jour un seuil
export function updateThreshold(id: string, value: number, domain?: string): boolean {
  const thresholds = getAllThresholds();
  let threshold;
  
  if (domain) {
    threshold = thresholds.find(t => t.id === id && t.domain === domain);
  } else {
    threshold = thresholds.find(t => t.id === id && !t.domain);
  }
  
  if (!threshold) return false;
  
  // Vérifier que la valeur est dans les limites
  if (value < threshold.minValue || value > threshold.maxValue) return false;
  
  threshold.currentValue = value;
  return true;
}

// Fonction pour obtenir les anti-patterns activés
export function getEnabledAntiPatterns(): ArchitectureRule[] {
  return getAllRules().filter(rule => rule.enabled);
}

// Fonction pour activer/désactiver une règle
export function toggleRule(id: string, enabled: boolean, domain?: string): boolean {
  const rules = getAllRules();
  let rule;
  
  if (domain) {
    rule = rules.find(r => r.id === id && r.domain === domain);
  } else {
    rule = rules.find(r => r.id === id && !r.domain);
  }
  
  if (!rule) return false;
  
  rule.enabled = enabled;
  return true;
}
