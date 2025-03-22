
import React, { useState } from 'react';
import HomeIndex from './HomeIndex';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { NotionCSVExporter, NotionDiagnosticReport } from '@/components/notion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

const HomePage = () => {
  const [showExporter, setShowExporter] = useState(false);
  
  const handleDiagnosticComplete = (success: boolean) => {
    if (success) {
      // Si le diagnostic réussit et on était en mode démo, proposer de désactiver
      if (operationMode.isDemoMode) {
        toast.success('Diagnostic réussi', {
          description: 'Notion fonctionne correctement. Voulez-vous désactiver le mode démonstration ?',
          action: {
            label: 'Désactiver',
            onClick: () => {
              operationMode.enableRealMode();
              window.location.reload();
            }
          }
        });
      }
    }
  };
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <NotionDiagnosticReport 
          buttonLabel="Diagnostic Notion"
          buttonClassName="shadow-lg"
          onDiagnosticComplete={handleDiagnosticComplete}
        />
        
        <Button 
          onClick={() => setShowExporter(true)}
          className="rounded-full shadow-lg flex items-center gap-2"
        >
          <Download size={16} />
          <span>Exporter CSV</span>
        </Button>
      </div>
      
      <Dialog open={showExporter} onOpenChange={setShowExporter}>
        <DialogContent className="max-w-3xl">
          <NotionCSVExporter onClose={() => setShowExporter(false)} />
        </DialogContent>
      </Dialog>
      
      <HomeIndex />
    </>
  );
};

export default HomePage;
