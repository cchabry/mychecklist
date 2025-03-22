
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import OperationModeSettings, { OperationModeSettingsButton } from '@/components/OperationModeSettings';
import OperationModeControl from '@/components/OperationModeControl';
import OperationModeStatus from '@/components/OperationModeStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Page dédiée à la configuration de l'application
 */
const ConfigPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="mr-2 p-2">
            <Link to="/">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Configuration de l'Application</h1>
        </div>
        <OperationModeStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OperationModeSettings />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mode Simplifié</CardTitle>
              <CardDescription>
                Version simplifiée du contrôleur de mode opérationnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OperationModeControl simplified />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Boutons d'accès</CardTitle>
              <CardDescription>
                Différentes façons d'accéder aux paramètres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm mb-2">Bouton avec sheet:</p>
                <OperationModeSettingsButton />
              </div>
              
              <div>
                <p className="text-sm mb-2">Bouton personnalisé:</p>
                <Button variant="default">
                  <Settings size={16} className="mr-2" />
                  Configuration avancée
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
