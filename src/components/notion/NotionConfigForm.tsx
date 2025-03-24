
import React from 'react';
import { NotionConfigComponent } from './config';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface NotionConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Composant de configuration Notion modal
 */
const NotionConfigForm: React.FC<NotionConfigFormProps> = ({ 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <NotionConfigComponent />
      </DialogContent>
    </Dialog>
  );
};

export default NotionConfigForm;
