
/**
 * Utilitaires pour le tableau de bord de l'architecture
 * 
 * Ce module expose des fonctions pour générer le tableau de bord
 * interactif des métriques d'architecture.
 */

export * from './charts';
export * from './content';
export * from './filters';
export * from './styles';
export * from './rules';

// Définir le type global pour les métriques d'architecture
export interface ArchitectureMetrics {
  timestamp: string;
  summary: {
    featuresTotal: number;
    featuresCompliant: number;
    complianceRate: number;
    issuesTotal: number;
    issuesBySeverity: Record<string, number>;
    filesByCategory: Record<string, number>;
  };
  domainDetails: {
    features: FeatureMetric[];
    services: ServiceMetric[];
    hooks: HookMetric[];
    components: ComponentMetric[];
  };
  antiPatterns: {
    detectedPatterns: DetectedAntiPattern[];
    thresholdViolations: ThresholdViolation[];
  };
  issues: IssueMetric[];
}

export interface FeatureMetric {
  name: string;
  compliant: boolean;
  missingFiles: string[];
  missingExports: string[];
}

export interface ServiceMetric {
  name: string;
  hasClearInterface: boolean;
  hasTypeDefs: boolean;
}

export interface HookMetric {
  name: string;
  compliant: boolean;
  issues: string[];
}

export interface ComponentMetric {
  name: string;
  hasPropsType: boolean;
  isExported: boolean;
}

export interface IssueMetric {
  domain: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface DetectedAntiPattern {
  ruleId: string;
  ruleName: string;
  severity: string;
  occurrences: number;
  affectedFiles: string[];
}

export interface ThresholdViolation {
  thresholdId: string;
  thresholdName: string;
  expectedValue: number;
  actualValue: number;
  description: string;
}
