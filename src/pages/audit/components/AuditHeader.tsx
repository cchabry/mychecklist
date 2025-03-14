
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
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
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Retour aux projets
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.url}</p>
        </div>
        
        <Button onClick={onSave}>
          <Save size={16} className="mr-2" />
          Sauvegarder
        </Button>
      </div>
    </>
  );
};

export default AuditHeader;
