
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotionFormActionsProps {
  onCancel: () => void;
  onReset: () => void;
  isSubmitting?: boolean;
}

const NotionFormActions: React.FC<NotionFormActionsProps> = ({ 
  onCancel, 
  onReset, 
  isSubmitting = false
}) => {
  return (
    <div className="flex justify-between pt-4">
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="text-amber-600 border-amber-200 hover:bg-amber-50" 
          onClick={onReset}
        >
          Réinitialiser
        </Button>
      </div>
      <Button type="submit" disabled={isSubmitting} className="bg-tmw-teal hover:bg-tmw-teal/90">
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            Vérification...
          </>
        ) : (
          "Enregistrer"
        )}
      </Button>
    </div>
  );
};

export default NotionFormActions;
