
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface NotionTestDataGeneratorProps {
  onGenerate?: () => void;
  disabled?: boolean;
}

const NotionTestDataGenerator: React.FC<NotionTestDataGeneratorProps> = ({ 
  onGenerate, 
  disabled = false
}) => {
  return (
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
  );
};

export default NotionTestDataGenerator;
