
import React from 'react';
import { Save } from 'lucide-react';

interface NotionLastSavedInfoProps {
  lastSaved: string | null;
}

const NotionLastSavedInfo: React.FC<NotionLastSavedInfoProps> = ({ lastSaved }) => {
  if (!lastSaved) return null;
  
  return (
    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
      <Save size={14} />
      <span>Dernière configuration sauvegardée: {lastSaved}</span>
    </div>
  );
};

export default NotionLastSavedInfo;
