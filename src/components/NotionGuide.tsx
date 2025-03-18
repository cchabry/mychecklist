
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { HelpCircle, Database, ArrowRight, Share2, Copy } from 'lucide-react';
import { isNotionConfigured } from '@/lib/notionService';

interface NotionGuideProps {
  onConnectClick: () => void;
}

const NotionGuide: React.FC<NotionGuideProps> = ({ onConnectClick }) => {
  const isConfigured = isNotionConfigured();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-tmw-teal/80 hover:text-tmw-teal hover:bg-tmw-teal/5">
          <HelpCircle size={16} />
          Guide d'intégration Notion
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl text-tmw-teal">Guide d'intégration Notion</SheetTitle>
          <SheetDescription>
            Comment lier votre base de données Notion à l'application
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <section className="space-y-2">
            <h3 className="text-lg font-medium">1. Créer une intégration Notion</h3>
            <p className="text-sm text-muted-foreground">
              Rendez-vous sur <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-tmw-teal underline">notion.so/my-integrations</a> et créez une nouvelle intégration.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>Notez votre <strong>clé API secrète</strong> d'intégration (commence par "secret_")</p>
            </div>
          </section>
          
          <section className="space-y-2">
            <h3 className="text-lg font-medium">2. Préparer votre base de données Notion</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Créez une base de données dans Notion avec les propriétés suivantes :</span>
              </li>
              <li className="ml-6 text-xs border border-border rounded-md overflow-hidden">
                <div className="bg-muted p-2 font-medium">Propriétés requises pour les projets :</div>
                <div className="p-2 space-y-1">
                  <p><strong>id</strong> (Texte enrichi) - Identifiant unique du projet</p>
                  <p><strong>name</strong> (Titre) - Nom du projet</p>
                  <p><strong>url</strong> (URL) - URL du site web</p>
                  <p><strong>progress</strong> (Nombre) - Progression de l'audit (0-100)</p>
                  <p><strong>itemsCount</strong> (Nombre) - Nombre d'éléments audités</p>
                </div>
              </li>
              <li className="ml-6 text-xs border border-border rounded-md overflow-hidden">
                <div className="bg-muted p-2 font-medium">Propriétés pour les items de checklist :</div>
                <div className="p-2 space-y-1">
                  <p><strong>ID</strong> (Texte enrichi) - Identifiant unique de l'item</p>
                  <p><strong>Catégorie</strong> (Sélecteur/Texte) - Catégorie principale</p>
                  <p><strong>Sous-catégorie</strong> (Sélecteur/Texte) - Sous-catégorie</p>
                  <p><strong>Sous sous catégorie</strong> (Sélecteur/Texte) - Niveau 3 de catégorisation</p>
                  <p><strong>Consigne</strong> (Titre) - Titre de l'item</p>
                  <p><strong>Résumé</strong> (Texte enrichi) - Description détaillée</p>
                  <p><strong>MetaREFs, Critère, Profil, Phase, Effort, Prio, Niveau d'exigence, Portée</strong> (Sélecteurs/Texte) - Tags de qualification</p>
                </div>
              </li>
              <li className="flex gap-2">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Partagez cette base de données avec votre intégration Notion :</span>
              </li>
              <li className="ml-6 space-y-2 border-l-2 border-tmw-teal/30 pl-4">
                <p><strong>Comment partager votre base de données avec l'intégration :</strong></p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Ouvrez votre base de données dans Notion</li>
                  <li>Cliquez sur les trois points <strong>...</strong> en haut à droite de la page</li>
                  <li>Sélectionnez <strong>"Ajouter des personnes, des groupes ou des intégrations"</strong> (ou <strong>"Share"</strong> en anglais) <Share2 size={14} className="inline ml-1 text-tmw-teal" /></li>
                  <li>Dans la fenêtre qui s'ouvre, saisissez le nom de votre intégration</li>
                  <li>Sélectionnez votre intégration dans la liste qui apparaît</li>
                  <li>Choisissez <strong>"Peut modifier"</strong> comme niveau d'autorisation</li>
                  <li>Confirmez en cliquant sur <strong>"Inviter"</strong></li>
                </ol>
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md text-yellow-800 text-xs mt-2">
                  <strong>Important :</strong> Sans cette étape de partage, l'intégration ne pourra pas accéder à votre base de données, même si vous avez configuré la clé API correctement.
                </div>
              </li>
              
              <li className="flex gap-2 mt-4">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Récupérez l'ID de votre base de données :</span>
              </li>
              <li className="ml-6 space-y-2 border-l-2 border-tmw-teal/30 pl-4">
                <p><strong>Comment trouver l'ID de votre base de données :</strong></p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Ouvrez votre base de données dans Notion</li>
                  <li>Regardez l'URL dans la barre d'adresse de votre navigateur</li>
                  <li>Le format est généralement: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">notion.so/workspace/[nom]-[ID]</code></li>
                  <li>L'ID de la base de données est la dernière partie de l'URL (après le dernier tiret)</li>
                  <li>Par exemple, dans: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs break-all">notion.so/workspace/MaBDD-abc123def456</code></li>
                  <li>L'ID à copier est: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">abc123def456</code></li>
                </ol>
                <div className="bg-blue-50 border border-blue-200 p-2 rounded-md text-blue-800 text-xs mt-2">
                  <strong>Astuce :</strong> Vous pouvez également utiliser l'ID complet de la base de données (y compris le nom), l'application extraira automatiquement l'ID correct.
                </div>
              </li>
            </ul>
          </section>
          
          <section className="space-y-2">
            <h3 className="text-lg font-medium">3. Connecter l'application</h3>
            <p className="text-sm text-muted-foreground">
              Utilisez le bouton "Connecter à Notion" pour configurer l'intégration.
            </p>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={onConnectClick}
                className="bg-tmw-teal hover:bg-tmw-teal/90 flex items-center gap-2"
              >
                <Database size={16} />
                {isConfigured ? 'Reconfigurer Notion' : 'Connecter à Notion'}
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionGuide;
