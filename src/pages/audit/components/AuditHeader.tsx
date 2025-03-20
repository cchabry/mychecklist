
import React from 'react';
import { ArrowLeft, Save, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types';

interface AuditHeaderProps {
  project: Project;
  onSave: () => void;
  onBack: () => void;
}

const AuditHeader: React.FC<AuditHeaderProps> = ({ project, onSave, onBack }) => {
  return (
    <>
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4 hover:text-tmw-teal"
      >
        <ArrowLeft size={16} className="mr-2" />
        Retour aux projets
      </Button>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-tmw-teal rounded-full p-2">
            <CheckSquare size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-tmw-darkgray">{project.name}</h1>
            <p className="text-muted-foreground">{project.url}</p>
          </div>
        </div>
        
        <Button onClick={onSave} className="bg-tmw-teal hover:bg-tmw-teal/90">
          <Save size={16} className="mr-2" />
          Sauvegarder
        </Button>
      </div>
    </>
  );
};

export default AuditHeader;
