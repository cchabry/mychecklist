
import React, { useState } from 'react';
import HomeIndex from './HomeIndex';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { NotionCSVExporter } from '@/components/notion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const HomePage = () => {
  const [showExporter, setShowExporter] = useState(false);
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
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
