
import React from 'react';
import { DiscoveryDialog } from './database-discovery';

export type NotionDatabaseTarget = 'projects' | 'checklists' | 'exigences' | 'pages' | 'audits' | 'evaluations' | 'actions' | 'progress';

interface NotionDatabaseDiscoveryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: string;
  onSelectDatabase?: (id: string, target: NotionDatabaseTarget) => void;
  autoClose?: boolean;
}

const NotionDatabaseDiscovery: React.FC<NotionDatabaseDiscoveryProps> = (props) => {
  return <DiscoveryDialog {...props} />;
};

export default NotionDatabaseDiscovery;
