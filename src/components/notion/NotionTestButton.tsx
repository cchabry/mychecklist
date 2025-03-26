import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check, XCircle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';

interface NotionTestButtonProps {
  onSuccess?: () => void;
}

const NotionTestButton: React.FC<NotionTestButtonProps> = ({ onSuccess }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleTestConnection = async () => {
    // Vérifier d'abord les valeurs dans localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    if (!apiKey || !dbId) {
      toast.error('Configuration Notion requise', {
        description: 'Veuillez d\'abord configurer votre clé API et votre base de données Notion.'
      });
      return;
    }
    
    setIsTesting(true);
    setTestStatus('idle');
    
    try {
      const wasDemoMode = operationMode.isDemoMode;
      if (wasDemoMode) {
        operationMode.enableRealMode();
      }
      
      const response = await notionApi.users.me();
      
      // Test réussi
      setTestStatus('success');
      toast.success('Connexion à Notion réussie', {
        description: `Connecté en tant que ${response.data?.user || 'Utilisateur Notion'}`
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Notion API connection test failed:', error);
      setTestStatus('error');
      
      toast.error('Erreur de connexion à Notion', {
        description: error instanceof Error ? error.message : 'Vérifiez votre configuration Notion'
      });
      
      // Revenir en mode démo en cas d'erreur
      operationMode.enableDemoMode('Erreur de connexion');
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
      onClick={handleTestConnection}
      disabled={isTesting}
    >
      {isTesting ? (
        <RotateCw size={16} className="animate-spin" />
      ) : testStatus === 'success' ? (
        <Check size={16} />
      ) : testStatus === 'error' ? (
        <XCircle size={16} />
      ) : (
        <RotateCw size={16} />
      )}
      Tester Notion
    </Button>
  );
};

export default NotionTestButton;
