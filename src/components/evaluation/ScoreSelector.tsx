
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ComplianceScore = 'CONFORME' | 'PARTIEL' | 'NON_CONFORME' | 'NA';

export interface ScoreSelectorProps {
  value: ComplianceScore;
  onChange: (value: ComplianceScore) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const scoreConfig = {
  'CONFORME': {
    label: 'Conforme',
    icon: CheckCircle,
    baseClasses: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    activeClasses: 'bg-green-100 border-green-300 ring-2 ring-green-200',
  },
  'PARTIEL': {
    label: 'Partiellement conforme',
    icon: AlertCircle,
    baseClasses: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
    activeClasses: 'bg-yellow-100 border-yellow-300 ring-2 ring-yellow-200',
  },
  'NON_CONFORME': {
    label: 'Non conforme',
    icon: XCircle,
    baseClasses: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    activeClasses: 'bg-red-100 border-red-300 ring-2 ring-red-200',
  },
  'NA': {
    label: 'Non applicable',
    icon: HelpCircle,
    baseClasses: 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
    activeClasses: 'bg-gray-100 border-gray-300 ring-2 ring-gray-200',
  },
};

/**
 * Sélecteur de niveau de conformité pour les évaluations
 */
export const ScoreSelector: React.FC<ScoreSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'text-xs gap-1.5 py-1 px-2',
    md: 'text-sm gap-2 py-1.5 px-3',
    lg: 'text-base gap-2 py-2 px-4',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {(Object.keys(scoreConfig) as ComplianceScore[]).map((score) => {
        const config = scoreConfig[score];
        const isActive = value === score;
        const Icon = config.icon;
        
        return (
          <Button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            disabled={disabled}
            className={cn(
              "border font-normal rounded-full transition-all",
              sizeClasses[size],
              config.baseClasses,
              isActive && config.activeClasses,
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className={cn(iconSizes[size])} />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ScoreSelector;
