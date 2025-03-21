import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface NotionTestDataGeneratorProps {
  onClose: () => void;
}

const NotionTestDataGenerator: React.FC<NotionTestDataGeneratorProps> = ({ onClose }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-md mb-4">
        <p className="text-sm text-yellow-800 font-medium">Générateur de données de test</p>
        <p className="text-xs text-yellow-700 mt-1">
          Cet outil permet de générer des données de test pour l'application. 
          Il crée des données fictives dans les bases de données Notion configurées.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="p-3 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Générer un projet avec audit</h3>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // Placeholder for generating test data
              console.log('Génération de données de test pour un projet avec audit');
              setTimeout(() => onClose(), 500);
            }}
          >
            <Database className="mr-2 h-4 w-4" />
            Générer un projet complet
          </Button>
        </div>
        
        <div className="p-3 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Générer une checklist d'audit</h3>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // Placeholder for generating checklist data
              console.log('Génération de données de test pour une checklist');
              setTimeout(() => onClose(), 500);
            }}
          >
            <Database className="mr-2 h-4 w-4" />
            Générer une checklist
          </Button>
        </div>
        
        <div className="p-3 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Générer des pages d'échantillon</h3>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // Placeholder for generating sample pages
              console.log('Génération de pages d\'échantillon');
              setTimeout(() => onClose(), 500);
            }}
          >
            <Database className="mr-2 h-4 w-4" />
            Générer des pages d'échantillon
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
};

export default NotionTestDataGenerator;
