
import React from 'react';
import { CheckCircle, FileCode } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const NotionSolutionsSection: React.FC = () => {
  return (
    <div className="bg-muted p-4 rounded-md">
      <h3 className="font-medium mb-3">Solutions possibles</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="missing-proxy">
          <AccordionTrigger className="text-sm font-medium">
            Vérifier le déploiement du fichier API Notion Proxy
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Le problème le plus courant est l'absence du fichier <code className="bg-gray-100 px-1 py-0.5 rounded">api/notion-proxy.ts</code> dans votre déploiement Vercel.</p>
            
            <div className="bg-slate-50 p-3 rounded border text-xs text-slate-800 font-mono mt-2">
              <div className="font-medium text-slate-900 mb-1">Étapes:</div>
              1. Vérifiez que le fichier <span className="text-green-600">api/notion-proxy.ts</span> existe dans votre projet<br />
              2. Assurez-vous que le fichier est bien inclus dans votre déploiement Vercel<br />
              3. Vérifiez que le déploiement est à jour (<span className="text-blue-600">redéployez si nécessaire</span>)<br />
              4. Vérifiez que <span className="text-purple-600">vercel.json</span> est correctement configuré
            </div>
            
            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-100 rounded text-xs">
              <FileCode size={16} className="mt-0.5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Structure de fichiers requise:</p>
                <pre className="mt-1 bg-white/60 p-2 rounded overflow-x-auto">
{`project/
├── api/
│   ├── notion-proxy.ts  (requis)
│   └── ping.ts
└── vercel.json`}
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="api-key">
          <AccordionTrigger className="text-sm font-medium">
            Vérifier la clé API Notion
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vérifiez que votre clé API commence par "secret_" et est correctement copiée</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assurez-vous que l'intégration a accès à la base de données (partagez la base avec l'intégration)</span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="db-id">
          <AccordionTrigger className="text-sm font-medium">
            Vérifier l'ID de base de données
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vérifiez l'ID de base de données dans l'URL Notion (doit être le dernier segment de l'URL)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>L'ID doit être dans le format correct (32 caractères alphanumériques ou avec des tirets)</span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="connectivity">
          <AccordionTrigger className="text-sm font-medium">
            Vérifier la connectivité
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vérifiez votre connexion internet</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assurez-vous que le domaine <code>api.notion.com</code> est accessible depuis votre serveur Vercel</span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NotionSolutionsSection;
