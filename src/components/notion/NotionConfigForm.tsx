
import React from 'react';
import { NotionConfig } from '@/components/notion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface NotionConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}

/**
 * Composant de configuration Notion modal
 */
const NotionConfigForm: React.FC<NotionConfigFormProps> = ({ 
  isOpen, 
  onClose,
  onSuccess,
  onSubmit,
  onCancel
}) => {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <NotionConfig />
      </DialogContent>
    </Dialog>
  );
};

export default NotionConfigForm;
