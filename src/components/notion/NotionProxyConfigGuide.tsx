
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Check, Copy, Share2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type DeploymentPlatform = 'vercel' | 'local' | 'netlify' | 'other';

const NotionProxyConfigGuide: React.FC = () => {
  const [platform, setPlatform] = useState<DeploymentPlatform>('vercel');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Commande copiée dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-4 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Guide de déploiement du proxy CORS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="outline" className="border-amber-200 bg-amber-50/50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm">
            Le proxy CORS est nécessaire pour contourner les limitations CORS de l'API Notion.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3 grid-cols-4">
          <Button 
            variant={platform === 'vercel' ? 'default' : 'outline'} 
            className="col-span-1"
            onClick={() => setPlatform('vercel')}
          >
            Vercel
          </Button>
          <Button 
            variant={platform === 'netlify' ? 'default' : 'outline'} 
            className="col-span-1"
            onClick={() => setPlatform('netlify')}
          >
            Netlify
          </Button>
          <Button 
            variant={platform === 'local' ? 'default' : 'outline'} 
            className="col-span-1"
            onClick={() => setPlatform('local')}
          >
            Local
          </Button>
          <Button 
            variant={platform === 'other' ? 'default' : 'outline'} 
            className="col-span-1"
            onClick={() => setPlatform('other')}
          >
            Autre
          </Button>
        </div>

        {platform === 'vercel' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Share2 size={14} />
              Déploiement sur Vercel
            </h3>
            <div className="bg-slate-50 p-3 rounded-md border relative group">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                <code>
                  npx vercel
                </code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy('npx vercel')}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
        )}

        {platform === 'netlify' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Share2 size={14} />
              Déploiement sur Netlify
            </h3>
            <div className="bg-slate-50 p-3 rounded-md border relative group">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                <code>
                  netlify deploy
                </code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy('netlify deploy')}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
        )}

        {platform === 'local' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Share2 size={14} />
              Déploiement local
            </h3>
            <div className="bg-slate-50 p-3 rounded-md border relative group">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                <code>
                  npm run dev
                </code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy('npm run dev')}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
        )}

        {platform === 'other' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Share2 size={14} />
              Autre plateforme
            </h3>
            <div className="bg-slate-50 p-3 rounded-md border">
              <p className="text-sm">
                Consultez la documentation de votre plateforme pour déployer une application Next.js avec un proxy API.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotionProxyConfigGuide;
