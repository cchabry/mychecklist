
import React from 'react';
import { Audit } from '@/types/domain';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditCardProps {
  audit: Audit;
}

export function AuditCard({ audit }: AuditCardProps) {
  const progress = audit.progress ?? 0;
  const itemsCount = audit.itemsCount ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{audit.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          <p>Créé le {format(new Date(audit.createdAt), 'PPP', { locale: fr })}</p>
          <p>Mis à jour le {format(new Date(audit.updatedAt), 'PPP', { locale: fr })}</p>
          {itemsCount > 0 && (
            <p className="mt-2">{itemsCount} items évalués</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link to={`/audits/${audit.id}`}>Voir l'audit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
