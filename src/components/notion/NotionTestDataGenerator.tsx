
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface NotionTestDataGeneratorProps {
  onGenerate?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

const NotionTestDataGenerator: React.FC<NotionTestDataGeneratorProps> = ({ 
  onGenerate, 
  onClose,
  disabled = false
}) => {
  return (
    <div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onGenerate} 
        disabled={disabled}
        className="gap-2"
      >
        <Database size={14} />
        Générer données de test
      </Button>

      {onClose && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="ml-2"
        >
          Fermer
        </Button>
      )}
    </div>
  );
};

export default NotionTestDataGenerator;
