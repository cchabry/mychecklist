
import React, { useState } from 'react';
import { useOperationMode } from '@/services/operationMode';
import OperationModeSettings, { OperationModeSettingsButton } from '@/components/OperationModeSettings';
import OperationModeControl from '@/components/OperationModeControl';
import OperationModeStatus from '@/components/OperationModeStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Database, Activity, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Page dédiée à la configuration de l'application
 */
const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mode');
  const { isDemoMode, isRealMode } = useOperationMode();
  
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="mode" className="flex items-center gap-2">
            <Activity size={16} />
            <span>Mode Opérationnel</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Autres réglages</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OperationModeSettings />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isDemoMode ? (
                      <>
                        <Database size={18} className="text-blue-500" />
                        Mode Démonstration
                      </>
                    ) : (
                      <>
                        <Info size={18} className="text-green-500" />
                        Mode Réel
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isDemoMode 
                      ? "L'application utilise des données simulées" 
                      : "L'application est connectée à Notion"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OperationModeControl simplified />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Accès rapide</CardTitle>
                  <CardDescription>
                    Actions et raccourcis pour le mode opérationnel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">Bouton avec panneau latéral:</p>
                    <OperationModeSettingsButton label="Ouvrir les paramètres" />
                  </div>
                  
                  <div>
                    <p className="text-sm mb-2">Navigation:</p>
                    <Button variant="default" asChild>
                      <Link to="/">
                        <ArrowLeft size={16} className="mr-2" />
                        Retour à l'accueil
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres supplémentaires</CardTitle>
              <CardDescription>
                Cet espace est réservé pour d'autres configurations à venir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground py-8 text-center">
                Les options de configuration supplémentaires seront ajoutées ultérieurement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigPage;
