
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check, XCircle, AlertCircle } from 'lucide-react';
import { testNotionConnection } from '@/lib/notion/notionClient';
import { toast } from 'sonner';

interface NotionTestButtonProps {
  onSuccess?: () => void;
  apiKey?: string;
  databaseId?: string;
}

const NotionTestButton: React.FC<NotionTestButtonProps> = ({ 
  onSuccess,
  apiKey: propApiKey,
  databaseId: propDatabaseId
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleTestConnection = async () => {
    // Utiliser les props ou les valeurs dans localStorage
    const apiKey = propApiKey || localStorage.getItem('notion_api_key');
    const dbId = propDatabaseId || localStorage.getItem('notion_database_id');
    
    if (!apiKey || !dbId) {
      toast.error('Configuration Notion requise', {
        description: 'Veuillez d\'abord configurer votre clé API et votre base de données Notion.'
      });
      return;
    }
    
    setIsTesting(true);
    setTestStatus('idle');
    
    // Stockage temporaire pour le test
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', dbId);
    
    try {
      const result = await testNotionConnection();
      
      if (result.success) {
        setTestStatus('success');
        
        toast.success('Connexion Notion réussie', {
          description: `Connecté en tant que ${result.user} avec accès à ${result.projectsDbName}`
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setTestStatus('error');
        
        toast.error(result.error || 'Échec de la connexion', {
          description: result.details || 'Vérifiez votre clé API et vos ID de base de données'
        });
      }
    } catch (error) {
      setTestStatus('error');
      
      toast.error('Erreur de test', {
        description: error.message || 'Une erreur s\'est produite lors du test'
      });
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
        <AlertCircle size={16} />
      )}
      Test de connexion
    </Button>
  );
};

export default NotionTestButton;
