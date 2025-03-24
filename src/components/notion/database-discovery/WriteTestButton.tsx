
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, FileText, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';
import { notionWriteService } from '@/services/notion/notionWriteService';

interface WriteTestButtonProps {
  databaseId: string;
  apiKey: string | null;
  label?: string;
}

const WriteTestButton: React.FC<WriteTestButtonProps> = ({ 
  databaseId, 
  apiKey, 
  label = "Tester l'écriture" 
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [details, setDetails] = useState<string | null>(null);
  
  const runWriteTest = async () => {
    if (!apiKey) {
      toast.error('Clé API requise', {
        description: 'Veuillez d\'abord configurer votre clé API Notion'
      });
      return;
    }
    
    if (!databaseId) {
      toast.error('ID de base de données requis', {
        description: 'Veuillez sélectionner une base de données'
      });
      return;
    }
    
    setIsTesting(true);
    setStatus('idle');
    setDetails(null);
    
    try {
      // Utiliser notre service d'écriture centralisé
      const success = await notionWriteService.testWritePermission(databaseId, apiKey);
      
      if (success) {
        setStatus('success');
        setDetails(`Test d'écriture réussi! Page créée et archivée dans la base`);
      } else {
        setStatus('error');
        setDetails('Échec du test d\'écriture');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test d\'écriture:', error);
      
      setStatus('error');
      setDetails(`Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${
              status === 'success' 
                ? 'border-green-300 text-green-700' 
                : status === 'error'
                ? 'border-red-300 text-red-700'
                : ''
            }`}
            onClick={runWriteTest}
            disabled={isTesting}
          >
            {isTesting ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : status === 'success' ? (
              <Check className="h-4 w-4" />
            ) : status === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {details || `Tester l'écriture dans la base de données sélectionnée`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WriteTestButton;
