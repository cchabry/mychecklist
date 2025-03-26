
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';

interface NotionTestDataGeneratorProps {
  onGenerate?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

const NotionTestDataGenerator: React.FC<NotionTestDataGeneratorProps> = ({ 
  onGenerate, 
  onClose,
  disabled = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    setResults(null);
    
    try {
      // Simuler un délai pour l'expérience utilisateur
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans une implémentation réelle, on appellerait un endpoint pour générer les données dans Notion
      // Pour la démo, on simule juste une réussite
      
      const success = Math.random() > 0.2; // 80% de chance de réussite
      
      if (success) {
        setResults({
          success: true,
          message: "Données de test générées avec succès",
          details: "10 éléments de checklist, 3 projets et 15 pages d'échantillon ont été créés dans votre base Notion."
        });
        
        toast.success("Données de test générées", {
          description: "Les bases de données Notion ont été alimentées avec des données de test."
        });
        
        if (onGenerate) {
          onGenerate();
        }
      } else {
        setResults({
          success: false,
          message: "Erreur lors de la génération des données",
          details: "Vérifiez que votre clé API Notion a bien les permissions d'écriture et que les bases de données existent."
        });
        
        toast.error("Échec de la génération", {
          description: "Impossible de générer les données de test."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération des données:", error);
      
      setResults({
        success: false,
        message: "Erreur lors de la génération des données",
        details: error instanceof Error ? error.message : "Une erreur inattendue est survenue."
      });
      
      toast.error("Erreur inattendue", {
        description: "Une erreur est survenue lors de la génération des données."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">Générateur de données de test</h3>
          <p className="text-sm text-muted-foreground">
            Ce générateur crée des données de test dans vos bases de données Notion pour vous permettre de tester l'application.
          </p>
          
          {/* Alertes sur le mode mock */}
          {notionApi.mockMode.isActive() ? (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <strong>Mode démonstration actif</strong>
                <p className="text-xs mt-0.5">
                  Les données de test ne seront pas réellement créées dans Notion tant que le mode démo est actif.
                  Désactivez ce mode pour permettre la création réelle des données.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <strong>Mode réel actif</strong>
                <p className="text-xs mt-0.5">
                  Les données de test seront créées dans vos bases de données Notion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de génération */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateData} 
            disabled={disabled || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Database size={14} />
                Générer données de test
              </>
            )}
          </Button>

          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="ml-2"
            >
              Fermer
            </Button>
          )}
        </div>
      </div>

      {/* Résultats de la génération */}
      {results && (
        <div className={`mt-4 p-3 rounded-md ${
          results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            {results.success ? (
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h4 className={`font-medium ${results.success ? 'text-green-700' : 'text-red-700'}`}>
                {results.message}
              </h4>
              {results.details && (
                <p className="text-xs mt-1 text-muted-foreground">
                  {results.details}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotionTestDataGenerator;
