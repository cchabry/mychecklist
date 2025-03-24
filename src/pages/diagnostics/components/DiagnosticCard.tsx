
import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DiagnosticCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Carte générique pour les diagnostics
 */
const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  title,
  description,
  children,
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default DiagnosticCard;
