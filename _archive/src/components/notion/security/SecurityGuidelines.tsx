
import React from 'react';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  ExternalLink,
  Key,
  FileText,
  Check,
  X
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';

/**
 * Composant affichant des recommandations de sécurité pour Notion
 */
const SecurityGuidelines: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Recommandations de sécurité</h3>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="token-security">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-amber-500" />
              <span>Gestion des tokens d'intégration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm">
              <p>Les tokens d'intégration Notion donnent accès à vos données. Protégez-les comme des mots de passe.</p>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-start gap-1.5">
                  <Check size={16} className="text-green-500 mt-0.5" />
                  <p>Restreindre les permissions de l'intégration au minimum nécessaire</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <Check size={16} className="text-green-500 mt-0.5" />
                  <p>Régénérer le token régulièrement ou en cas de suspicion</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <X size={16} className="text-red-500 mt-0.5" />
                  <p>Ne jamais partager votre token dans des fichiers publics ou du code source</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <X size={16} className="text-red-500 mt-0.5" />
                  <p>Ne jamais stocker votre token dans des services non sécurisés</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="storage-best-practices">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-500" />
              <span>Stockage sécurisé des clés</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm">
              <p>Cette application stocke de manière chiffrée vos tokens dans votre navigateur.</p>
              
              <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                  <p><strong>Important :</strong> Le stockage local du navigateur n'est pas complètement sécurisé contre un attaquant ayant accès à votre ordinateur.</p>
                </div>
                
                <div className="flex items-start gap-1.5">
                  <Check size={16} className="text-green-500 mt-0.5" />
                  <p>Déconnectez-vous et effacez les clés lorsque vous utilisez un appareil partagé</p>
                </div>
                
                <div className="flex items-start gap-1.5">
                  <Check size={16} className="text-green-500 mt-0.5" />
                  <p>Pour des déploiements d'entreprise, envisagez un backend sécurisé</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="oauth-vs-integration">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              <span>OAuth vs Token d'intégration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm">
              <p>Notion propose deux types d'authentification:</p>
              
              <div className="mt-2 space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">Token d'intégration (commence par "secret_")</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Accès permanent aux ressources configurées</li>
                    <li>Idéal pour les intégrations serveur-serveur</li>
                    <li>Configurable depuis les paramètres d'intégration Notion</li>
                  </ul>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium">OAuth (commence par "ntn_")</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Accès délégué au nom d'un utilisateur</li>
                    <li>Requiert une app Notion officiellement enregistrée</li>
                    <li>Idéal pour les applications multi-utilisateurs</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => window.open('https://developers.notion.com/docs/authorization', '_blank')}
        >
          Documentation Notion
          <ExternalLink size={14} />
        </Button>
      </div>
    </div>
  );
};

export default SecurityGuidelines;
