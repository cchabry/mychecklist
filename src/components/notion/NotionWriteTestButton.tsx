
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Check, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { notionWriteService } from '@/services/notion/notionWriteService';
import { notionApi } from '@/lib/notionProxy';

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
      toast.error('Configuration Notion requise', {
        description: 'Veuillez d\'abord configurer votre clé API et votre base de données Notion.'
      });
      return;
    }
    
    setIsTesting(true);
    setTestStatus('idle');
    
    try {
      // Forcer le mode réel pour ce test
      const wasInMockMode = notionApi.mockMode.isActive();
      if (wasInMockMode) {
        console.log('📝 Désactivation temporaire du mode mock pour le test d\'écriture');
        notionApi.mockMode.deactivate();
      }
      
      // Créer un projet de test avec un timestamp pour unicité
      const timestamp = new Date().toISOString();
      const testProject = {
        name: `Test d'écriture ${timestamp}`,
        description: "Projet de test pour vérifier l'écriture dans Notion",
        url: "https://exemple.fr/test",
        status: "Test"
      };
      
      console.log('📝 Tentative de création d\'un projet de test:', testProject);
      
      // Utiliser le service d'écriture centralisé
      const result = await notionWriteService.createProject(testProject);
      
      if (result) {
        console.log('✅ Test d\'écriture réussi!', result);
        setTestStatus('success');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Échec de création du projet de test');
      }
    } catch (error) {
      console.error('❌ Test d\'écriture Notion échoué:', error);
      setTestStatus('error');
      
      // Le service d'écriture gère déjà l'affichage des erreurs
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
