import React from 'react';
import { ArrowLeft, Save, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types';
interface AuditHeaderProps {
  project: Project;
  onSave: () => void;
  onBack: () => void;
}
const AuditHeader: React.FC<AuditHeaderProps> = ({
  project,
  onSave,
  onBack
}) => {
  return <>
      <Button variant="ghost" onClick={onBack} className="mb-4 hover:text-tmw-teal">
        <ArrowLeft size={16} className="mr-2" />
        Retour aux projets
      </Button>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-3xl font-bold text-tmw-darkgray">{project.name}</h1>
            <p className="text-muted-foreground text-center">{project.url}</p>
          </div>
        </div>
        
        
      </div>
    </>;
};
export default AuditHeader;