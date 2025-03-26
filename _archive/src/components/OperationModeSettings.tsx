
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Slider
} from '@/components/ui/slider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Info, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Schéma de validation pour le formulaire des paramètres
const settingsSchema = z.object({
  autoSwitchOnFailure: z.boolean().default(true),
  maxConsecutiveFailures: z.number().min(1).max(10).default(3),
  persistentModeStorage: z.boolean().default(true),
  showNotifications: z.boolean().default(true),
  useCacheInRealMode: z.boolean().default(true),
  errorSimulationRate: z.number().min(0).max(100).default(10),
  simulatedNetworkDelay: z.number().min(0).max(5000).default(500),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// Composant bouton pour afficher les paramètres dans une popover
export const OperationModeSettingsButton: React.FC<{ 
  className?: string,
  label?: string 
}> = ({ className = '', label = 'Paramètres' }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Settings size={16} className="mr-2" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="font-medium mb-2">Paramètres du mode opérationnel</h3>
        <OperationModeSettings />
      </PopoverContent>
    </Popover>
  );
};

// Composant principal pour les paramètres du mode opérationnel
const OperationModeSettings: React.FC = () => {
  const { settings, updateSettings } = useOperationMode();
  
  // Initialiser le formulaire avec les paramètres actuels
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
  });
  
  // Gérer la soumission du formulaire
  const onSubmit = (values: SettingsFormValues) => {
    updateSettings(values);
    toast.success('Paramètres mis à jour');
  };
  
  // Mettre à jour les paramètres à chaque changement
  const handleValueChange = (field: keyof SettingsFormValues, value: any) => {
    form.setValue(field, value);
    // Appliquer immédiatement les changements
    const currentValues = form.getValues();
    updateSettings({ ...currentValues, [field]: value });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="autoSwitchOnFailure"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Basculement automatique</FormLabel>
                <FormDescription>
                  Activer le mode démo automatiquement après plusieurs échecs
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleValueChange('autoSwitchOnFailure', value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {form.watch('autoSwitchOnFailure') && (
          <FormField
            control={form.control}
            name="maxConsecutiveFailures"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Nombre d'échecs avant basculement</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleValueChange('maxConsecutiveFailures', value[0])}
                    />
                  </FormControl>
                  <span className="w-8 text-center">{field.value}</span>
                </div>
                <FormDescription>
                  Nombre d'erreurs consécutives avant de basculer en mode démo
                </FormDescription>
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="persistentModeStorage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Conserver le mode</FormLabel>
                <FormDescription>
                  Se souvenir du mode opérationnel entre les sessions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleValueChange('persistentModeStorage', value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="showNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Notifications</FormLabel>
                <FormDescription>
                  Afficher des notifications lors des changements de mode
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleValueChange('showNotifications', value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="rounded-lg border p-3">
          <h3 className="font-medium flex items-center gap-2 mb-2">
            <Info size={16} />
            Paramètres du mode démo
          </h3>
          
          <div className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="errorSimulationRate"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Taux d'erreurs simulées (%)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => handleValueChange('errorSimulationRate', value[0])}
                      />
                    </FormControl>
                    <span className="w-8 text-center">{field.value}%</span>
                  </div>
                  <FormDescription>
                    Pourcentage de requêtes qui échoueront en mode démo
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="simulatedNetworkDelay"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Délai réseau simulé (ms)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={2000}
                        step={100}
                        onValueChange={(value) => handleValueChange('simulatedNetworkDelay', value[0])}
                      />
                    </FormControl>
                    <span className="w-16 text-center">{field.value} ms</span>
                  </div>
                  <FormDescription>
                    Délai simulé pour les requêtes en mode démo
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default OperationModeSettings;
