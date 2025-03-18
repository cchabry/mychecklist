
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface NotionConnectButtonProps {
  usingNotion: boolean;
  onClick: () => void;
  id?: string; // Add optional id prop
}

const NotionConnectButton: React.FC<NotionConnectButtonProps> = ({ 
  usingNotion, 
  onClick,
  id // Include id in destructuring
}) => {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 text-tmw-teal border-tmw-teal/20 hover:bg-tmw-teal/5"
      onClick={onClick}
      id={id} // Pass id to the Button component
    >
      <Database size={16} />
      {usingNotion ? 'Reconfigurer Notion' : 'Connecter à Notion'}
    </Button>
  );
};

export default NotionConnectButton;
