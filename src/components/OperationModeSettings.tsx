
import React, { useState } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { OperationMode, OperationModeSettings as Settings } from '@/services/operationMode/types';
import { Database, Activity, AlertTriangle, Check, X, Settings as SettingsIcon, Info, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import OperationModeStatus from './OperationModeStatus';

interface OperationModeSettingsProps {
  expanded?: boolean;
  onClose?: () => void;
}

const OperationModeSettings: React.FC<OperationModeSettingsProps> = ({ 
  expanded = false,
  onClose
}) => {
  const { 
    isDemoMode,
    isRealMode,
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    toggle,
    enableDemoMode,
    enableRealMode,
    updateSettings,
    reset
  } = useOperationMode();

  const [activeTab, setActiveTab] = useState<string>("general");
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Gérer les changements de paramètres
  const handleSettingChange = (key: keyof Settings, value: any) => {
    updateSettings({ [key]: value });
    toast.success('Paramètre mis à jour', {
      description: `Le paramètre "${key}" a été mis à jour.`
    });
  };

  // Réinitialiser complètement le service
  const handleReset = () => {
    reset();
    setShowConfirmReset(false);
    toast.success('Réinitialisation complète', {
      description: 'Tous les paramètres du mode opérationnel ont été réinitialisés.'
    });
  };

  // Annulation de confirmation de réinitialisation
  const cancelReset = () => {
    setShowConfirmReset(false);
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg border-0">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-purple-500" />
            <CardTitle>Configuration du Mode Opérationnel</CardTitle>
          </div>
          <OperationModeStatus size="md" />
        </div>
        <CardDescription>
          Définissez comment l'application interagit avec Notion et gère les erreurs de connexion
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4 border-b">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
        </div>

        {/* Onglet Général */}
        <TabsContent value="general" className="p-6 pt-4">
          <div className="space-y-6">
            {/* Section État actuel */}
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Info size={18} />
                État actuel
              </h3>
              <div className="bg-slate-50 p-4 rounded-md border">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Mode actif:</span>
                  <Badge className={`${isRealMode ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {isRealMode ? 'Mode Réel (Notion)' : 'Mode Démonstration'}
                  </Badge>
                </div>

                {isDemoMode && switchReason && (
                  <div className="mb-3 text-sm flex gap-2">
                    <span className="font-medium min-w-32">Raison:</span>
                    <span className="text-slate-600">{switchReason}</span>
                  </div>
                )}

                {failures > 0 && (
                  <div className="mb-3 text-sm flex gap-2">
                    <span className="font-medium min-w-32">Erreurs consécutives:</span>
                    <span className="text-amber-600 font-medium">{failures}</span>
                  </div>
                )}

                {lastError && (
                  <div className="text-sm flex gap-2">
                    <span className="font-medium min-w-32">Dernière erreur:</span>
                    <span className="text-red-600">{lastError.message}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Section Toggle principal */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mode-toggle" className="text-base font-medium flex items-center gap-2">
                  <Database size={18} className={isDemoMode ? "text-blue-500" : "text-gray-400"} />
                  Mode Démonstration
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Utilise des données simulées au lieu de se connecter à Notion
                </p>
              </div>
              <Switch
                id="mode-toggle"
                checked={isDemoMode}
                onCheckedChange={() => toggle()}
              />
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2 pt-4">
              <Button
                variant={isRealMode ? "outline" : "default"}
                onClick={() => enableRealMode()}
                className={isRealMode ? "bg-gray-100" : "bg-green-600 hover:bg-green-700 text-white"}
                disabled={isRealMode}
              >
                <Check size={16} className="mr-2" />
                Activer Mode Réel
              </Button>
              <Button
                variant={isDemoMode ? "outline" : "default"}
                onClick={() => enableDemoMode("Activation manuelle")}
                className={isDemoMode ? "bg-gray-100" : "bg-blue-600 hover:bg-blue-700 text-white"}
                disabled={isDemoMode}
              >
                <Database size={16} className="mr-2" />
                Activer Mode Démo
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Paramètres avancés */}
        <TabsContent value="advanced" className="p-6 pt-4">
          <div className="space-y-6">
            <div className="grid gap-4">
              {/* Basculement automatique */}
              <div className="bg-slate-50 p-4 rounded-md border">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="auto-switch" className="text-base font-medium flex items-center gap-2">
                    <RefreshCw size={18} className="text-purple-500" />
                    Basculement automatique
                  </Label>
                  <Switch
                    id="auto-switch"
                    checked={settings.autoSwitchOnFailure}
                    onCheckedChange={(checked) => handleSettingChange('autoSwitchOnFailure', checked)}
                  />
                </div>
                <p className="text-sm text-slate-600 ml-7">
                  Bascule automatiquement en mode démo après plusieurs échecs de connexion consécutifs
                </p>

                {settings.autoSwitchOnFailure && (
                  <div className="mt-3 ml-7">
                    <Label htmlFor="threshold" className="text-sm text-slate-700 mb-1 block">
                      Seuil d'échecs consécutifs
                    </Label>
                    <Select
                      value={settings.maxConsecutiveFailures.toString()}
                      onValueChange={(value) => handleSettingChange('maxConsecutiveFailures', parseInt(value))}
                    >
                      <SelectTrigger id="threshold" className="w-full">
                        <SelectValue placeholder="Seuil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 erreur</SelectItem>
                        <SelectItem value="2">2 erreurs</SelectItem>
                        <SelectItem value="3">3 erreurs</SelectItem>
                        <SelectItem value="5">5 erreurs</SelectItem>
                        <SelectItem value="10">10 erreurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Persistance et Notifications */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="bg-slate-50 p-4 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="persistence" className="text-sm font-medium">
                      Conserver le mode entre les sessions
                    </Label>
                    <Switch
                      id="persistence"
                      checked={settings.persistentModeStorage}
                      onCheckedChange={(checked) => handleSettingChange('persistentModeStorage', checked)}
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Mémorise le mode opérationnel lorsque vous rechargez la page
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="notif-duration" className="text-sm font-medium">
                      Durée des notifications (ms)
                    </Label>
                    <Input
                      id="notif-duration"
                      type="number"
                      min="1000"
                      max="15000"
                      step="1000"
                      value={settings.notificationDuration}
                      onChange={(e) => handleSettingChange('notificationDuration', parseInt(e.target.value))}
                      className="w-24 h-8 text-right"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Durée d'affichage des notifications de changement de mode
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section actions avancées */}
            <div>
              <h3 className="text-sm font-medium mb-3">Actions avancées</h3>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowConfirmReset(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Réinitialiser
                </Button>
              </div>

              {showConfirmReset && (
                <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700 mb-2">
                    Cette action réinitialisera tous les paramètres du mode opérationnel, y compris le compteur d'erreurs et le mode actif.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={handleReset}>
                      Confirmer la réinitialisation
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelReset}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Onglet Diagnostics */}
        <TabsContent value="diagnostics" className="p-6 pt-4">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                État du service
              </h3>

              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="font-medium">Mode actuel:</span>
                  <span>{mode === 'real' ? 'Réel (Notion)' : 'Démonstration'}</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="font-medium">Erreurs:</span>
                  <span>{failures} consécutives</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="font-medium">Auto-switch:</span>
                  <span>{settings.autoSwitchOnFailure ? `Activé (seuil: ${settings.maxConsecutiveFailures})` : 'Désactivé'}</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="font-medium">Persistance:</span>
                  <span>{settings.persistentModeStorage ? 'Activée' : 'Désactivée'}</span>
                </div>
              </div>
            </div>

            {lastError && (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} className="text-red-500" />
                  Dernière erreur
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-red-800">{lastError.name}</p>
                  <p className="text-red-700">{lastError.message}</p>
                  {lastError.stack && (
                    <details>
                      <summary className="cursor-pointer text-red-600 text-xs mt-2">Voir la stack trace</summary>
                      <pre className="mt-2 text-xs overflow-x-auto p-2 bg-red-100 rounded text-red-800">
                        {lastError.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => reset()}
                className="w-full"
              >
                <RefreshCw size={16} className="mr-2" />
                Réinitialiser le service et effacer les erreurs
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CardFooter className="border-t flex justify-between pt-4">
        <div className="text-xs text-slate-500">
          {isRealMode ? (
            <span className="flex items-center gap-1">
              <Check size={14} className="text-green-500" />
              Connecté à Notion
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Database size={14} className="text-blue-500" />
              Mode démonstration actif
            </span>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Composant pour afficher le bouton d'accès aux paramètres dans un sheet
export const OperationModeSettingsButton: React.FC<{
  label?: string;
  className?: string;
}> = ({ label = "Paramètres du mode", className }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={className}>
          <SettingsIcon size={16} className="mr-2" />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Paramètres du mode opérationnel</SheetTitle>
          <SheetDescription>
            Configurez comment l'application interagit avec Notion
          </SheetDescription>
        </SheetHeader>
        <OperationModeSettings />
      </SheetContent>
    </Sheet>
  );
};

export default OperationModeSettings;
