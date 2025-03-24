
import React from 'react';
import { DiscoveryDialog } from './database-discovery';

interface NotionDatabaseDiscoveryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: string;
}

const NotionDatabaseDiscovery: React.FC<NotionDatabaseDiscoveryProps> = (props) => {
  return <DiscoveryDialog {...props} />;
};

export default NotionDatabaseDiscovery;
