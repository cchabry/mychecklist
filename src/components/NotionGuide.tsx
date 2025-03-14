
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { HelpCircle, Database, ArrowRight } from 'lucide-react';
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
                <div className="bg-muted p-2 font-medium">Propriétés requises :</div>
                <div className="p-2 space-y-1">
                  <p><strong>id</strong> (Texte enrichi) - Identifiant unique du projet</p>
                  <p><strong>name</strong> (Titre) - Nom du projet</p>
                  <p><strong>url</strong> (URL) - URL du site web</p>
                  <p><strong>progress</strong> (Nombre) - Progression de l'audit (0-100)</p>
                  <p><strong>itemsCount</strong> (Nombre) - Nombre d'éléments audités</p>
                </div>
              </li>
              <li className="flex gap-2">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Partagez cette base de données avec votre intégration Notion</span>
              </li>
            </ul>
          </section>
          
          <section className="space-y-2">
            <h3 className="text-lg font-medium">3. Connecter l'application</h3>
            <p className="text-sm text-muted-foreground">
              Utilisez le bouton "Connecter à Notion" sur la page d'accueil pour configurer l'intégration.
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

          <section className="space-y-2 pt-4 border-t border-border">
            <h3 className="text-lg font-medium">Comment ça fonctionne</h3>
            <p className="text-sm text-muted-foreground">
              Une fois configurée, l'application essaiera de charger vos projets depuis Notion au lieu d'utiliser les données fictives.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Lors de l'accès à un projet, l'application recherchera les données correspondantes dans Notion</span>
              </li>
              <li className="flex gap-2">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Si un projet est trouvé, ses données seront utilisées pour afficher l'audit</span>
              </li>
              <li className="flex gap-2">
                <ArrowRight size={16} className="text-tmw-teal shrink-0 mt-0.5" />
                <span>Les modifications apportées à l'audit seront synchronisées avec Notion lorsque vous sauvegardez</span>
              </li>
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionGuide;
