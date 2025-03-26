
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Server } from 'lucide-react';

interface NotionErrorActionsProps {
  onCopyDetails: () => void;
  isProxyMessage: boolean;
}

const NotionErrorActions: React.FC<NotionErrorActionsProps> = ({
  onCopyDetails,
  isProxyMessage
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        variant="outline" 
        className="flex gap-2"
        onClick={onCopyDetails}
      >
        <Copy size={16} />
        Copier les détails
      </Button>
      {isProxyMessage ? (
        <Button 
          className="flex gap-2 bg-tmw-teal hover:bg-tmw-teal/90"
          asChild
        >
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
            <Server size={16} />
            Accéder à Vercel
          </a>
        </Button>
      ) : (
        <Button 
          className="flex gap-2 bg-tmw-teal hover:bg-tmw-teal/90"
          asChild
        >
          <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} />
            Gérer les intégrations Notion
          </a>
        </Button>
      )}
    </div>
  );
};

export default NotionErrorActions;
