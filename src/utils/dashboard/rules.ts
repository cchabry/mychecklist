
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
  checkFn?: (data: any) => boolean; // Fonction pour vérifier si la règle est respectée
}

export interface ComplianceThreshold {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultValue: number;
  currentValue: number;
  minValue: number;
  maxValue: number;
}

// Anti-patterns spécifiques à détecter
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

// Seuils de conformité configurables
export const complianceThresholds: ComplianceThreshold[] = [
  {
    id: 'overall-compliance',
    name: 'Conformité globale',
    description: 'Seuil minimal de conformité globale du projet',
    category: 'global',
    defaultValue: 80,
    currentValue: 80, // Valeur actuelle, peut être modifiée
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

// Fonction pour récupérer les seuils de conformité
export function getComplianceThresholds(): ComplianceThreshold[] {
  // Ici, on pourrait charger les valeurs personnalisées depuis un fichier de configuration
  return complianceThresholds;
}

// Fonction pour obtenir un seuil spécifique
export function getThreshold(id: string): number {
  const threshold = complianceThresholds.find(t => t.id === id);
  return threshold ? threshold.currentValue : 0;
}

// Fonction pour mettre à jour un seuil
export function updateThreshold(id: string, value: number): boolean {
  const threshold = complianceThresholds.find(t => t.id === id);
  if (!threshold) return false;
  
  // Vérifier que la valeur est dans les limites
  if (value < threshold.minValue || value > threshold.maxValue) return false;
  
  threshold.currentValue = value;
  return true;
}

// Fonction pour obtenir les anti-patterns activés
export function getEnabledAntiPatterns(): ArchitectureRule[] {
  return antiPatterns.filter(rule => rule.enabled);
}

// Fonction pour activer/désactiver une règle
export function toggleRule(id: string, enabled: boolean): boolean {
  const rule = antiPatterns.find(r => r.id === id);
  if (!rule) return false;
  
  rule.enabled = enabled;
  return true;
}
