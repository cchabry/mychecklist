
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check, XCircle, AlertTriangle } from 'lucide-react';
import { notionWriteService } from '@/services/notion/notionWriteService';

interface NotionWriteTestButtonProps {
  onSuccess?: () => void;
}

const NotionWriteTestButton: React.FC<NotionWriteTestButtonProps> = ({ onSuccess }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleTestWrite = async () => {
    // Vérifier les valeurs dans localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    console.log('🔍 Démarrage du test d\'écriture avec:', {
      'API Key présente': !!apiKey,
      'Database ID présent': !!dbId,
      'API Key (début)': apiKey ? apiKey.substring(0, 8) + '...' : 'non définie',
      'Database ID': dbId || 'non défini'
    });
    
    if (!apiKey || !dbId) {
      return;
    }
    
    setIsTesting(true);
    setTestStatus('idle');
    
    try {
      const success = await notionWriteService.testWritePermission(dbId, apiKey);
      
      setTestStatus(success ? 'success' : 'error');
      
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Test d\'écriture échoué:', error);
      setTestStatus('error');
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${
        testStatus === 'success' 
          ? 'text-green-600 border-green-300 hover:bg-green-50' 
          : testStatus === 'error'
          ? 'text-red-600 border-red-300 hover:bg-red-50'
          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
      }`}
      onClick={handleTestWrite}
      disabled={isTesting}
    >
      {isTesting ? (
        <RotateCw size={16} className="animate-spin" />
      ) : testStatus === 'success' ? (
        <Check size={16} />
      ) : testStatus === 'error' ? (
        <XCircle size={16} />
      ) : (
        <AlertTriangle size={16} />
      )}
      Test d'écriture
    </Button>
  );
};

export default NotionWriteTestButton;
