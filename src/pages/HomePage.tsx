
import React, { useState } from 'react';
import HomeIndex from './HomeIndex';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { NotionCSVExporter, NotionDiagnosticReport } from '@/components/notion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

const HomePage = () => {
  const [showExporter, setShowExporter] = useState(false);
  
  const handleDiagnosticComplete = (success: boolean) => {
    if (success) {
      // Si le diagnostic réussit et on était en mode mock, proposer de désactiver
      if (notionApi.mockMode.isActive()) {
        toast.success('Diagnostic réussi', {
          description: 'Notion fonctionne correctement. Voulez-vous désactiver le mode démonstration ?',
          action: {
            label: 'Désactiver',
            onClick: () => {
              notionApi.mockMode.forceReset();
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
