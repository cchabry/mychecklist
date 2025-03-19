
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { isNotionConfigured } from '@/lib/notion';
import { toast } from 'sonner';

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
      console.log('🔄 Test de connexion avec clé API:', apiKey.substring(0, 8) + '...');
      
      // Tenter de récupérer l'utilisateur Notion (me)
      const user = await notionApi.users.me(apiKey);
      console.log('✅ Notion API connection successful, user:', user.name);
      
      // Test réussi
      setTestStatus('success');
      toast.success('Connexion à Notion réussie', {
        description: `Connecté en tant que ${user.name}`
      });
      
      // Si un callback onSuccess est fourni, l'appeler
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Notion API connection test failed:', error);
      setTestStatus('error');
      
      // Afficher une erreur détaillée
      toast.error('Erreur de connexion à Notion', {
        description: error.message || 'Vérifiez votre configuration Notion'
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
      ) : (
        <RotateCw size={16} />
      )}
      Tester Notion
    </Button>
  );
};

export default NotionTestButton;
